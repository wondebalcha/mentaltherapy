from django.contrib import admin
from .models import Post, Comment, Like


# Register your models here.
class PostAdmin(admin.ModelAdmin):
    list_display = ('author', 'title', 'content', 'likeCount','commentCount', 'created_at')

admin.site.register(Post, PostAdmin)

class CommentAdmin(admin.ModelAdmin):
    list_display = ('commenter', 'get_post', 'content', 'created_at')
    
    def get_post(self, obj):
        return obj.post.title + " - " + obj.post.content
    get_post.short_description = 'Post'

admin.site.register(Comment, CommentAdmin)

class LikeAdmin(admin.ModelAdmin):
    list_display = ('liker', 'get_post')
    
    def get_post(self, obj):
        return obj.post.title + " - " + obj.post.content
    get_post.short_description = 'Post'
    
admin.site.register(Like, LikeAdmin)