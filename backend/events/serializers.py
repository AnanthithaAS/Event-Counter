from rest_framework import serializers
from .models import Event


class EventSerializer(serializers.ModelSerializer):
    owner_username = serializers.ReadOnlyField(source='owner.username')

    class Meta:
        model = Event
        fields = (
            'id',
            'title',
            'target_date',
            'description',
            'category',
            'owner',
            'owner_username',
            'created_at',
            'updated_at',
        )
        read_only_fields = ('id', 'owner', 'owner_username', 'created_at', 'updated_at')

    def validate_title(self, value):
        if not value or not value.strip():
            raise serializers.ValidationError("Title cannot be empty.")
        return value.strip()
