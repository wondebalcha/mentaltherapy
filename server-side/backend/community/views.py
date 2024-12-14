from django.shortcuts import render
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny
from .models import Comment, Post, Like
from .serializer import CommentSerializer, PostSerializer, LikeSerializer
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver

# Create your views here.
class PostList(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes =[AllowAny]

class PostListCreateAPIView(viewsets.ModelViewSet):
    queryset = Post.objects.all().order_by('-created_at')
    serializer_class = PostSerializer
    permission_classes =[AllowAny]
    
    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        if user_id:
            
            queryset = Post.objects.filter(author=user_id)

            return queryset
    
    def get_object(self):
        post_id = self.kwargs.get('pk')
        
        try:
            post = Post.objects.get(pk=post_id)
        except Post.DoesNotExist:
            raise Http404("Post not found")
        
        return post

class CommentListCreateAPIView(viewsets.ModelViewSet):
    queryset = Comment.objects.all().order_by('-created_at')
    serializer_class = CommentSerializer
    permission_classes =[AllowAny]

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        if post_id:
            
            queryset = Comment.objects.filter(post=post_id)

            return queryset
    
    def get_object(self):
        comment_id = self.kwargs.get('pk')
        
        try:
            comment = Comment.objects.get(pk=comment_id)
        except Comment.DoesNotExist:
            raise Http404("Post not found")
        
        return comment

class LikeViewSet(viewsets.ModelViewSet):
    queryset = Like.objects.all()
    serializer_class = LikeSerializer
    permission_classes =[AllowAny]

    def get_queryset(self):
        post_id = self.kwargs.get('post_id')
        if post_id:
            
            queryset = Like.objects.filter(post=post_id)

            return queryset
    
    def get_object(self):
        liker_id = self.kwargs.get('pk')
        queryset = self.get_queryset()
        try:
            like = queryset.get(liker_id=liker_id)
        except queryset.DoesNotExist:
            raise Http404("Like not found")
        return like

@receiver(post_save, sender=Comment)
def update_comment_count(sender, instance, **kwargs):
    post_id = instance.post_id
    post = Post.objects.get(pk=post_id)
    post.commentCount += 1
    post.save()

@receiver(post_delete, sender=Comment)
def update_comment_count(sender, instance, **kwargs):
    post_id = instance.post_id
    post = Post.objects.get(pk=post_id)
    post.commentCount -= 1
    post.save()
    
@receiver(post_save, sender=Like)
def update_comment_count(sender, instance, **kwargs):
    post_id = instance.post_id
    post = Post.objects.get(pk=post_id)
    post.likeCount += 1
    post.save()
    
@receiver(post_delete, sender=Like)
def update_comment_count(sender, instance, **kwargs):
    post_id = instance.post_id
    post = Post.objects.get(pk=post_id)
    post.likeCount -= 1
    post.save()