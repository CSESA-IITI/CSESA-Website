# events/admin.py
from django.contrib import admin
from .models import Event

@admin.register(Event)
class EventAdmin(admin.ModelAdmin):
    list_display = ['name', 'date', 'location', 'created_by', 'created_at']
    list_filter = ['date', 'created_at']
    search_fields = ['name', 'description', 'location']
