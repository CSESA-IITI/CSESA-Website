# events/serializers.py
from rest_framework import serializers
from .models import Event
from users.serializers import UserSerializer

class EventSerializer(serializers.ModelSerializer):
    created_by_data = UserSerializer(source='created_by', read_only=True)

    class Meta:
        model = Event
        fields = [
            'id', 'name', 'date', 'location', 'description', 'tags',
            'created_by', 'created_by_data', 'created_at', 'updated_at'
        ]
        read_only_fields = ['created_by', 'created_at', 'updated_at']
