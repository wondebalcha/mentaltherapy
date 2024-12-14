from django.contrib import admin
from .models import User, Profile, Patient, Therapist, Feedback


class UserAdmin(admin.ModelAdmin):
    list_display = ['username', 'email']


class ProfileAdmin(admin.ModelAdmin):
    list_display = ['user', 'first_name', 'last_name', 'gender', 'age']
    
class PatientAdmin(admin.ModelAdmin):
    list_display = ['get_first_name', 'get_last_name', 'get_gender', 'get_age']

    def get_first_name(self, obj):
        return obj.profile.first_name
    
    def get_last_name(self, obj):
        return obj.profile.last_name
    
    def get_gender(self, obj):
        return obj.profile.gender
    
    def get_age(self, obj):
        return obj.profile.age

    get_first_name.short_description = 'First Name'
    get_last_name.short_description = 'Last Name'
    get_gender.short_description = 'Gender'
    get_age.short_description = 'Age'

class TherapistAdmin(admin.ModelAdmin):
    list_display = ['get_first_name', 'get_last_name', 'get_gender', 'get_age']

    def get_first_name(self, obj):
        return obj.profile.first_name
    
    def get_last_name(self, obj):
        return obj.profile.last_name
    
    def get_gender(self, obj):
        return obj.profile.gender
    
    def get_age(self, obj):
        return obj.profile.age

    get_first_name.short_description = 'First Name'
    get_last_name.short_description = 'Last Name'
    get_gender.short_description = 'Gender'
    get_age.short_description = 'Age'

class FeedbackAdmin(admin.ModelAdmin):
    list_display = ['first_name', 'last_name', 'email', 'message']


admin.site.register(User, UserAdmin)
admin.site.register(Profile,ProfileAdmin)
admin.site.register(Patient,PatientAdmin)
admin.site.register(Therapist,TherapistAdmin)
admin.site.register(Feedback, FeedbackAdmin)

