from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.conf import settings

class IsOrganizationMember(BasePermission):
    """
    Permission to check if user belongs to the allowed organization domain
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        user_email = request.user.email
        if not user_email:
            return False
        
        email_domain = user_email.split('@')[-1].lower()
        allowed_domain = getattr(settings, 'ALLOWED_ORGANIZATION_DOMAIN', '').lower()
        
        return email_domain == allowed_domain

class IsPresident(BasePermission):
    """
    Permission for President role - highest level access
    """
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role == 'PRESIDENT')

class IsDomainHead(BasePermission):
    """
    Permission for Domain Head role
    """
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role == 'HEAD')

class IsCoordinator(BasePermission):
    """
    Permission for Coordinator role
    """
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role == 'COORDINATOR')

class IsAssociate(BasePermission):
    """
    Permission for Associate role - basic access
    """
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role == 'ASSOCIATE')

class IsPresidentOrDomainHead(BasePermission):
    """
    Permission for President or Domain Head roles
    """
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role in ['PRESIDENT', 'HEAD'])

class IsLeadershipRole(BasePermission):
    """
    Permission for leadership roles (President, Domain Head, Coordinator)
    """
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role in ['PRESIDENT', 'HEAD', 'COORDINATOR'])

class IsOwnerOrReadOnly(BasePermission):
    """
    Object-level permission to only allow owners of an object to edit it.
    Assumes the model instance has an `owner` attribute.
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions are allowed to any request,
        # so we'll always allow GET, HEAD or OPTIONS requests.
        if request.method in SAFE_METHODS:
            return True
        
        # Instance must have an attribute named `owner`.
        return obj == request.user

class IsOwnerOrLeadership(BasePermission):
    """
    Object-level permission to allow owners or leadership roles to edit objects
    """
    def has_object_permission(self, request, view, obj):
        # Read permissions for authenticated organization members
        if request.method in SAFE_METHODS:
            return request.user and request.user.is_authenticated
        
        # Write permissions for owner or leadership roles
        if obj == request.user:
            return True
        
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role in ['PRESIDENT', 'HEAD', 'COORDINATOR'])


class CanManageProjectContributors(BasePermission):
    """
    Permission class for project contributor management operations.
    Allows project creators and leadership roles to manage contributors.
    """
    def has_permission(self, request, view):
        # Must be authenticated
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user can manage contributors for the specific project.
        obj should be a Project instance.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Use the project's can_manage_contributors method
        return obj.can_manage_contributors(request.user)


class CanViewProjectContributors(BasePermission):
    """
    Permission class for viewing project contributor information.
    More permissive than management - allows viewing by team members and leadership.
    """
    def has_permission(self, request, view):
        # Must be authenticated
        return request.user and request.user.is_authenticated
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user can view contributors for the specific project.
        obj should be a Project instance.
        """
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Project creator can view
        if obj.created_by == request.user:
            return True
        
        # Team members can view
        if obj.team_members.filter(id=request.user.id).exists():
            return True
        
        # Leadership roles can view
        if request.user.role in ['PRESIDENT', 'HEAD', 'COORDINATOR']:
            return True
        
        return False


class CanManageEvents(BasePermission):
    """
    Permission class for event management operations.
    Allows presidents, heads, and event creators to manage events.
    """
    def has_permission(self, request, view):
        # Read permissions for everyone (including unauthenticated users)
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions require authentication
        if not request.user or not request.user.is_authenticated:
            return False
        
        # For create operations, only presidents and heads can create
        if view.action == 'create':
            return request.user.role in ['PRESIDENT', 'HEAD']
        
        # For update/delete operations, check object-level permissions
        return True
    
    def has_object_permission(self, request, view, obj):
        """
        Check if user can manage the specific event.
        obj should be an Event instance.
        """
        # Read permissions for everyone
        if request.method in SAFE_METHODS:
            return True
        
        # Write permissions require authentication
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Event creator can manage their own events
        if obj.created_by == request.user:
            return True
        
        # Presidents and heads can manage all events
        if request.user.role in ['PRESIDENT', 'HEAD']:
            return True
        
        return False