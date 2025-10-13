from rest_framework import serializers
from django.utils import timezone
from .models import Event
from users.serializers import UserSerializer

class EventSerializer(serializers.ModelSerializer):
    created_by = UserSerializer(read_only=True)
    can_edit = serializers.SerializerMethodField()
    can_delete = serializers.SerializerMethodField()
    
    class Meta:
        model = Event
        fields = [
            'id',
            'title',
            'description',
            'date',
            'location',
            'created_by',
            'can_edit',
            'can_delete',
            'created_at',
            'updated_at',
        ]
        read_only_fields = ['created_at', 'updated_at', 'created_by', 'can_edit', 'can_delete']

    def get_can_edit(self, obj):
        """
        Determine if the current user can edit this event.
        """
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        
        # Event creator can edit
        if obj.created_by == request.user:
            return True
        
        # Presidents and heads can edit all events
        if request.user.role in ['PRESIDENT', 'HEAD']:
            return True
        
        return False

    def get_can_delete(self, obj):
        """
        Determine if the current user can delete this event.
        """
        request = self.context.get('request')
        if not request or not request.user or not request.user.is_authenticated:
            return False
        
        # Event creator can delete
        if obj.created_by == request.user:
            return True
        
        # Presidents and heads can delete all events
        if request.user.role in ['PRESIDENT', 'HEAD']:
            return True
        
        return False

    def validate_date(self, value):
        """
        Validate that the event date is in the future.
        """
        if value <= timezone.now():
            raise serializers.ValidationError("Event date must be in the future.")
        return value