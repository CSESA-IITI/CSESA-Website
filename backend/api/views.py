from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from users.models import CustomUser
from projects.models import Project
from events.models import Event
from datetime import datetime

@api_view(['GET'])
@permission_classes([AllowAny])
def system_stats(request):
    """
    Public endpoint for system statistics that doesn't require authentication
    """
    try:
        # Count users
        total_users = CustomUser.objects.count()
        active_members = CustomUser.objects.filter(is_onboarded=True).count()
        
        # Count events
        total_events = Event.objects.count()
        upcoming_events = Event.objects.filter(date__gt=datetime.now()).count()
        
        # Count projects
        total_projects = Project.objects.count()
        # Count projects with deployment links as "completed"
        completed_projects = Project.objects.exclude(deployment_link__isnull=True).exclude(deployment_link__exact='').count()
        
        return Response({
            'totalUsers': total_users,
            'activeMembers': active_members,
            'totalEvents': total_events,
            'upcomingEvents': upcoming_events,
            'totalProjects': total_projects,
            'completedProjects': completed_projects,
            'success': True
        })
    except Exception as e:
        return Response({
            'error': str(e),
            'success': False
        }, status=500)