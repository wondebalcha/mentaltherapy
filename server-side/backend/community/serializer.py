from .models import Post, Comment, Like
from core.models import User, Profile
from rest_framework import serializers

class CommentSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    commenter = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    class Meta:
        model = Comment
        fields = ['id', 'post', 'commenter', 'first_name', 'last_name', 'image', 'content', 'created_at']
    
        
    def get_first_name(self, obj):
        user_id = obj.commenter
        user = Profile.objects.get(user_id=user_id)
        return user.first_name if user else ""

    def get_last_name(self, obj):
        user_id = obj.commenter
        user = Profile.objects.get(user_id=user_id)
        return user.last_name if user else ""
    
    def get_image(self, obj):
        try:
            user = Profile.objects.get(user_id=obj.commenter_id)
            request = self.context.get('request')
            if user.image and request:
                return request.build_absolute_uri(user.image.url)
            return ""
        except Profile.DoesNotExist:
            return ""
        
class PostSerializer(serializers.ModelSerializer):
    first_name = serializers.SerializerMethodField()
    last_name = serializers.SerializerMethodField()
    author_id = serializers.SerializerMethodField()
    image = serializers.SerializerMethodField()
    author = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    class Meta:
        model = Post
        fields = ['id', 'author', 'first_name', 'last_name', 'author_id', 'image', 'title', 'content', 'postImage','likeCount', 'commentCount', 'created_at']
    
    def get_first_name(self, obj):
        user_id = obj.author
        user = Profile.objects.get(user_id=user_id)
        return user.first_name if user else ""

    def get_last_name(self, obj):
        user_id = obj.author
        user = Profile.objects.get(user_id=user_id)
        return user.last_name if user else ""
    
    def get_author_id(self, obj):
        user_id = obj.author
        user = Profile.objects.get(user_id=user_id)
        return user.user_id if user else ""
    
    def get_image(self, obj):
        try:
            user = Profile.objects.get(user_id=obj.author_id)
            request = self.context.get('request')
            if user.image and request:
                return request.build_absolute_uri(user.image.url)
            return ""
        except Profile.DoesNotExist:
            return ""
    
class LikeSerializer(serializers.ModelSerializer):
    class Meta:
        model = Like
        fields = '__all__'