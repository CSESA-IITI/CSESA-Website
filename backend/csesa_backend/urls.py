from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenRefreshView
from users.views import ObtainTokenPairWithUserDataView, InviteUserView, UserProfileView, UserManagementViewSet, SkillViewSet
from projects.views import ProjectViewSet, DomainViewSet
from events.views import EventViewSet
from contact.views import ContactMessageCreateView



router = DefaultRouter()
router.register(r'projects', ProjectViewSet)
router.register(r'domains', DomainViewSet)
router.register(r'events', EventViewSet)
router.register(r'skills', SkillViewSet)
router.register(r'admin/users', UserManagementViewSet, basename='user-management')

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include(router.urls)),
    path('api/token/', ObtainTokenPairWithUserDataView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('api/profile/', UserProfileView.as_view(), name='user_profile'),
    path('api/invite/', InviteUserView.as_view(), name='invite_user'),
    path('api/contact/', ContactMessageCreateView.as_view(), name='contact_message'),
]

# Serve static and media files during development
if settings.DEBUG:
    urlpatterns += static(settings.STATIC_URL, document_root=settings.STATICFILES_DIRS[0])
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)