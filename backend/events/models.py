from django.db import models
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from django.utils import timezone

User = get_user_model()

class Event(models.Model):
    title = models.CharField(max_length=200, help_text="Event title")
    description = models.TextField(help_text="Event description")
    date = models.DateTimeField(help_text="Event date and time")
    location = models.CharField(max_length=200, help_text="Event location")
    created_by = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='created_events',
        help_text="User who created this event"
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ['-date']
        indexes = [
            models.Index(fields=['date']),
            models.Index(fields=['created_by']),
        ]

    def clean(self):
        """Validate that event date is in the future"""
        if self.date and self.date <= timezone.now():
            raise ValidationError({
                'date': 'Event date must be in the future.'
            })

    def save(self, *args, **kwargs):
        self.full_clean()
        super().save(*args, **kwargs)

    def __str__(self):
        return self.title