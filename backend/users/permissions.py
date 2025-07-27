from rest_framework.permissions import BasePermission, SAFE_METHODS
from django.conf import settings

class IsOrganizationMember(BasePermission):
    """
    Permission to check if user belongs to the allowed organization domain
    """
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Check if user's email domain matches the allowed organization domain
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
                request.user.role == 'DOMAIN_HEAD')

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
                request.user.role in ['PRESIDENT', 'DOMAIN_HEAD'])

class IsLeadershipRole(BasePermission):
    """
    Permission for leadership roles (President, Domain Head, Coordinator)
    """
    def has_permission(self, request, view):
        return (request.user and 
                request.user.is_authenticated and 
                request.user.role in ['PRESIDENT', 'DOMAIN_HEAD', 'COORDINATOR'])

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
                request.user.role in ['PRESIDENT', 'DOMAIN_HEAD', 'COORDINATOR'])