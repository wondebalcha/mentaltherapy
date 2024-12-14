from django.db import models
from core.models import User
from django.conf import settings
# Create your models here.
class Post(models.Model):
    author = models.ForeignKey(User, on_delete = models.CASCADE, related_name= 'postAuthor')
    title = models.CharField(max_length = 100)
    content = models.TextField()
    likeCount = models.IntegerField(default=0)
    commentCount = models.IntegerField(default=0)
    created_at = models.DateTimeField(auto_now_add = True)
    postImage = models.ImageField(upload_to="post_images", blank = True)

class Comment(models.Model):
    post = models.ForeignKey(Post, on_delete = models.CASCADE, related_name = 'comments')
    commenter = models.ForeignKey(User, on_delete = models.CASCADE, related_name= 'commentAuthor')
    content = models.TextField()
    created_at = models.DateTimeField(auto_now_add = True)

class Like(models.Model):
    post = models.ForeignKey(Post, on_delete = models.CASCADE, related_name = 'likes')
    liker = models.ForeignKey(User, on_delete = models.CASCADE, related_name= 'likeAuthor')