from django.db import models

class Event(models.Model):
    name = models.CharField(max_length=200)
    date = models.DateTimeField()
    location = models.CharField(max_length=200)
    tags = models.CharField(max_length=200, help_text="Comma-separated tags")
    description = models.TextField(blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name