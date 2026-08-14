from rest_framework import viewsets, permissions, filters
from .models import Event
from .serializers import EventSerializer


class EventViewSet(viewsets.ModelViewSet):
    """
    ViewSet providing full CRUD operations for Events.
    Only the authenticated user's events are returned or modifiable.
    """
    serializer_class = EventSerializer
    permission_classes = [permissions.IsAuthenticated]
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description', 'category']
    ordering_fields = ['target_date', 'created_at', 'title']
    ordering = ['target_date']

    def get_queryset(self):
        # Strictly isolate events to the authenticated owner
        return Event.objects.filter(owner=self.request.user).order_by('target_date')

    def perform_create(self, serializer):
        # Automatically assign logged in user as owner
        serializer.save(owner=self.request.user)
