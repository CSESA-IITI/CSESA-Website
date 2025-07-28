from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from users.views import UserProfileView, UserManagementViewSet, TeamViewSet
from projects.views import ProjectViewSet, DomainViewSet
from events.views import EventViewSet



router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'domains', DomainViewSet)
router.register(r'events', EventViewSet)
router.register(r'admin/users', UserManagementViewSet, basename='user-management')
router.register(r'team', TeamViewSet)

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/accounts/', include('accounts.urls')),
    path('api/contact/', include('contacts.urls')),
]

# Serve static files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])