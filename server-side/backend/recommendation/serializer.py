from rest_framework import serializers
from core.models import Therapist
from core.serializer import ProfileSerializer
class SimpleTherapistSerializer(serializers.ModelSerializer):
    profile = ProfileSerializer()
    class Meta:
        model = Therapist
        fields =['id', 'profile', 'experience','specialization','rating', 'licenses', 'religion']