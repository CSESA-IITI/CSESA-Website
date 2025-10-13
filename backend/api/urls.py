from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import TagViewSet, ProjectViewSet, system_stats

router = DefaultRouter()
router.register(r'tags', TagViewSet)
router.register(r'projects', ProjectViewSet)

urlpatterns = [
    path('', include(router.urls)),
    path('stats/', system_stats, name='system_stats'),
]
