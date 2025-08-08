# users/urls.py
from django.urls import path
# Import all the necessary views and modules
from . import views
from .views import (
    RegisterView,
    UserListView,
    UserDetailView,
    DomainListView,
    RoleListView,
    MyTokenObtainPairView
)
from rest_framework_simplejwt.views import TokenRefreshView

app_name = 'users'

urlpatterns = [
    # General user management endpoints
    path('register/', RegisterView.as_view(), name='register'),
    path('list/', UserListView.as_view(), name='user-list'),
    path('<int:pk>/', UserDetailView.as_view(), name='user-detail'),
    
    # Endpoints for related models
    path('domains/', DomainListView.as_view(), name='domain-list'),
    path('roles/', RoleListView.as_view(), name='role-list'),

    # --- CORRECTED JWT AUTHENTICATION ENDPOINTS ---
    # Use your custom view for the primary token endpoint to include user data
    path('token/', MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    
    # The standard refresh view is fine
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    # Logout endpoint
    path('logout/', views.logout_view, name='logout'),
]