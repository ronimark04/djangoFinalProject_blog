from rest_framework.routers import DefaultRouter
from .views import *
from django.urls import path, include

router = DefaultRouter()

router.register('users', UserViewSet, basename='user')
router.register('articles', ArticleViewSet, basename='article')

urlpatterns = [
    path('', include(router.urls)),
]
