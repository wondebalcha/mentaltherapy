from django.contrib import admin
from communication.models import ChatMessage, TherapistAvailability, Appointments, RoomInsights, \
                                    Notification, Review, Counter, StatusRecord

# Register your models here.
class ChatMessageAdmin(admin.ModelAdmin):
    list_editable = ['is_read', 'message']
    list_display = ['user','sender', 'reciever', 'is_read', 'message']
    
class TherapistAvailabilityAdmin(admin.ModelAdmin):
    list_display = ('therapist', 'date', 'start_time', 'end_time', 'is_available')

class AppointmentsAdmin(admin.ModelAdmin):
    list_display = ('get_therapist', 'get_patient', 'get_date', 'get_start_time', \
                        'get_end_time', 'room' , 'host')

    def get_therapist(self, obj):
        return obj.date_available.therapist
    get_therapist.short_description = 'Therapist'

    def get_patient(self, obj):
        return obj.patient
    get_patient.short_description = 'Patient'

    def get_date(self, obj):
        return obj.date_available.date
    get_date.short_description = 'Date'

    def get_start_time(self, obj):
        return obj.date_available.start_time
    get_start_time.short_description = 'Start Time'

    def get_end_time(self, obj):
        return obj.date_available.end_time
    get_end_time.short_description = 'End Time'

class NotificationAdmin(admin.ModelAdmin):
    list_display = ('therapist','patient', 'title', 'therapistContent','patientContent', 'sent_at')
    
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('name','get_therapist', 'description', 'rating')
    
    def get_therapist(self, obj):
        return obj.therapist.profile.user.email
    get_therapist.short_description = 'Therapist'

class StatusRecordAdmin(admin.ModelAdmin):
    list_display = ('patient', 'therapist_name', 'note', 'date')
    
admin.site.register( ChatMessage,ChatMessageAdmin)
admin.site.register(TherapistAvailability, TherapistAvailabilityAdmin)
admin.site.register(Appointments, AppointmentsAdmin)
admin.site.register(RoomInsights)
admin.site.register(Counter)
admin.site.register(StatusRecord, StatusRecordAdmin)
admin.site.register(Notification, NotificationAdmin)
admin.site.register(Review, ReviewAdmin)
