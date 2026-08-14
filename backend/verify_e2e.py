import os
import django

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from events.models import Event

def run_verification():
    print("==================================================")
    print("Starting Comprehensive E2E Verification for Event Countdown Timer")
    print("==================================================")

    client = APIClient()

    # Clean up test users if they exist
    User.objects.filter(username__in=['alice_e2e', 'bob_e2e']).delete()

    # 1. Register Alice
    print("\n[Step 1] Testing User Registration...")
    reg_resp = client.post('/api/register/', {
        'username': 'alice_e2e',
        'email': 'alice@example.com',
        'password': 'Password123!'
    }, format='json')
    assert reg_resp.status_code == 201, f"Registration failed: {reg_resp.data}"
    alice_token = reg_resp.data['access']
    print("  [OK] Alice registered successfully. JWT Access token obtained.")

    # 2. Login Alice
    print("\n[Step 2] Testing User Login...")
    login_resp = client.post('/api/login/', {
        'username': 'alice_e2e',
        'password': 'Password123!'
    }, format='json')
    assert login_resp.status_code == 200, f"Login failed: {login_resp.data}"
    assert 'access' in login_resp.data
    assert login_resp.data['user']['username'] == 'alice_e2e'
    print("  [OK] Alice logged in. Access and refresh tokens received.")

    # 3. Create Events for Alice
    print("\n[Step 3] Creating Multiple Events for Alice...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {alice_token}')
    now = timezone.now()

    # Upcoming event in 10 days
    e1_resp = client.post('/api/events/', {
        'title': 'Trip to Hawaii',
        'target_date': (now + timedelta(days=10)).isoformat(),
        'category': 'Vacation',
        'description': 'Pack sunscreen and swimwear'
    }, format='json')
    assert e1_resp.status_code == 201, f"Create event 1 failed: {e1_resp.data}"
    e1_id = e1_resp.data['id']
    print(f"  [OK] Created Event 1 (Trip to Hawaii, ID: {e1_id})")

    # Near event in 2 days
    e2_resp = client.post('/api/events/', {
        'title': 'Dentist Appointment',
        'target_date': (now + timedelta(days=2)).isoformat(),
        'category': 'Personal',
        'description': 'Regular dental cleaning'
    }, format='json')
    assert e2_resp.status_code == 201, f"Create event 2 failed: {e2_resp.data}"
    e2_id = e2_resp.data['id']
    print(f"  [OK] Created Event 2 (Dentist Appointment, ID: {e2_id})")

    # Past / expired event (yesterday)
    e3_resp = client.post('/api/events/', {
        'title': 'Project Submission',
        'target_date': (now - timedelta(days=1)).isoformat(),
        'category': 'Work',
        'description': 'Submit full project report'
    }, format='json')
    assert e3_resp.status_code == 201, f"Create event 3 failed: {e3_resp.data}"
    e3_id = e3_resp.data['id']
    print(f"  [OK] Created Event 3 (Project Submission, ID: {e3_id} - Expired)")

    # 4. List Events for Alice & Verify Sorting
    print("\n[Step 4] Verifying Event Listing & Sorting...")
    list_resp = client.get('/api/events/')
    assert list_resp.status_code == 200, f"List events failed: {list_resp.data}"
    assert len(list_resp.data) == 3, f"Expected 3 events, got {len(list_resp.data)}"
    titles = [e['title'] for e in list_resp.data]
    print(f"  [OK] Retrieved {len(list_resp.data)} events in chronological order: {titles}")
    assert titles[0] == 'Project Submission'
    assert titles[1] == 'Dentist Appointment'
    assert titles[2] == 'Trip to Hawaii'

    # 5. Update Event
    print("\n[Step 5] Testing Event Update...")
    update_resp = client.put(f'/api/events/{e2_id}/', {
        'title': 'Emergency Dentist Appointment',
        'target_date': (now + timedelta(days=1)).isoformat(),
        'category': 'Personal',
        'description': 'Moved appointment forward'
    }, format='json')
    assert update_resp.status_code == 200, f"Update failed: {update_resp.data}"
    assert update_resp.data['title'] == 'Emergency Dentist Appointment'
    print(f"  [OK] Event {e2_id} successfully updated.")

    # 6. User Isolation Test with Bob
    print("\n[Step 6] Testing User Data Isolation (Bob)...")
    reg_bob = client.post('/api/register/', {
        'username': 'bob_e2e',
        'email': 'bob@example.com',
        'password': 'Password123!'
    }, format='json')
    assert reg_bob.status_code == 201
    bob_token = reg_bob.data['access']

    # Authenticate as Bob
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {bob_token}')
    bob_list = client.get('/api/events/')
    assert len(bob_list.data) == 0, f"Bob should have 0 events, found {len(bob_list.data)}"
    print("  [OK] Bob's event list is empty (cannot see Alice's events).")

    # Bob attempts to view Alice's event
    bob_access_alice = client.get(f'/api/events/{e1_id}/')
    assert bob_access_alice.status_code == 404, "Bob should not be able to retrieve Alice's event"
    print("  [OK] Bob cannot access Alice's event (returned 404).")

    # Bob attempts to edit Alice's event
    bob_edit_alice = client.put(f'/api/events/{e1_id}/', {
        'title': 'Hacked Hawaii',
        'target_date': (now + timedelta(days=10)).isoformat()
    }, format='json')
    assert bob_edit_alice.status_code == 404, "Bob should not be able to edit Alice's event"
    print("  [OK] Bob cannot edit Alice's event (returned 404).")

    # Bob attempts to delete Alice's event
    bob_delete_alice = client.delete(f'/api/events/{e1_id}/')
    assert bob_delete_alice.status_code == 404, "Bob should not be able to delete Alice's event"
    print("  [OK] Bob cannot delete Alice's event (returned 404).")

    # 7. Delete Event as Alice
    print("\n[Step 7] Testing Event Deletion as Owner...")
    client.credentials(HTTP_AUTHORIZATION=f'Bearer {alice_token}')
    del_resp = client.delete(f'/api/events/{e3_id}/')
    assert del_resp.status_code == 204, f"Delete failed: {del_resp.status_code}"
    print(f"  [OK] Event {e3_id} deleted successfully.")

    final_list = client.get('/api/events/')
    assert len(final_list.data) == 2
    print(f"  [OK] Alice now has exactly {len(final_list.data)} events remaining.")

    # Cleanup
    User.objects.filter(username__in=['alice_e2e', 'bob_e2e']).delete()

    print("\n==================================================")
    print("ALL E2E VERIFICATION CHECKS PASSED SUCCESSFULLY!")
    print("==================================================")

if __name__ == '__main__':
    run_verification()
