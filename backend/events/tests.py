from django.test import TestCase
from django.contrib.auth.models import User
from django.utils import timezone
from datetime import timedelta
from rest_framework.test import APIClient
from rest_framework import status
from .models import Event


class EventsAPITests(TestCase):
    def setUp(self):
        self.client = APIClient()
        self.user1 = User.objects.create_user(username='alice', email='alice@example.com', password='password123')
        self.user2 = User.objects.create_user(username='bob', email='bob@example.com', password='password123')

        self.client.force_authenticate(user=self.user1)

        self.now = timezone.now()
        self.event1 = Event.objects.create(
            title="Alice's Birthday",
            target_date=self.now + timedelta(days=10),
            owner=self.user1
        )
        self.event2 = Event.objects.create(
            title="Alice's Vacation",
            target_date=self.now + timedelta(days=5),
            owner=self.user1
        )
        self.bob_event = Event.objects.create(
            title="Bob's Exam",
            target_date=self.now + timedelta(days=2),
            owner=self.user2
        )

    def test_unauthenticated_cannot_access_events(self):
        self.client.force_authenticate(user=None)
        response = self.client.get('/api/events/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_list_events_only_returns_owner_events(self):
        response = self.client.get('/api/events/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # Should contain event1 and event2, but NOT bob_event
        self.assertEqual(len(response.data), 2)
        titles = [e['title'] for e in response.data]
        self.assertIn("Alice's Birthday", titles)
        self.assertIn("Alice's Vacation", titles)
        self.assertNotIn("Bob's Exam", titles)

    def test_events_sorted_by_nearest_target_date(self):
        response = self.client.get('/api/events/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # event2 (5 days) should come before event1 (10 days)
        self.assertEqual(response.data[0]['title'], "Alice's Vacation")
        self.assertEqual(response.data[1]['title'], "Alice's Birthday")

    def test_create_event_auto_assigns_owner(self):
        target = (self.now + timedelta(days=20)).isoformat()
        payload = {
            'title': 'New Year Party',
            'target_date': target,
            'category': 'Celebration',
            'description': 'Gathering with friends'
        }
        response = self.client.post('/api/events/', payload, format='json')
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data['title'], 'New Year Party')
        self.assertEqual(response.data['owner_username'], 'alice')
        
        event_obj = Event.objects.get(id=response.data['id'])
        self.assertEqual(event_obj.owner, self.user1)

    def test_cannot_access_other_users_event(self):
        # Alice tries to retrieve Bob's event
        response = self.client.get(f'/api/events/{self.bob_event.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Alice tries to update Bob's event
        response = self.client.put(f'/api/events/{self.bob_event.id}/', {
            'title': 'Hacked Title',
            'target_date': (self.now + timedelta(days=1)).isoformat()
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

        # Alice tries to delete Bob's event
        response = self.client.delete(f'/api/events/{self.bob_event.id}/')
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_update_own_event(self):
        new_target = (self.now + timedelta(days=12)).isoformat()
        response = self.client.put(f'/api/events/{self.event1.id}/', {
            'title': "Alice's Big Birthday",
            'target_date': new_target,
            'category': 'Birthday'
        }, format='json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.event1.refresh_from_db()
        self.assertEqual(self.event1.title, "Alice's Big Birthday")

    def test_delete_own_event(self):
        response = self.client.delete(f'/api/events/{self.event1.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertFalse(Event.objects.filter(id=self.event1.id).exists())
