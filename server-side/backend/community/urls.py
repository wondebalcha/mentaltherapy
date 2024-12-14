from django.urls import path
from . import views
from .views import PostListCreateAPIView, CommentListCreateAPIView, LikeViewSet, PostList
from rest_framework.routers import DefaultRouter


router = DefaultRouter()
router.register(r'post/(?P<user_id>\d+)', PostListCreateAPIView, basename='post')
router.register(r'comment/(?P<post_id>\d+)', CommentListCreateAPIView, basename='comment')
router.register(r'like/(?P<post_id>\d+)', LikeViewSet, basename='like')
router.register(r'posts', PostList, basename='posts')

urlpatterns = router.urls 