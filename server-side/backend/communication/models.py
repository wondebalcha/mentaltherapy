from django.db import models
from core.models import User, Profile, Patient, Therapist
from django.utils import timezone

# Create your models here.

#Chat-APP
class ChatMessage(models.Model):
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="user")
    sender = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="sender")
    reciever = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, related_name="reciever")

    message = models.CharField(max_length=10000000000)

    is_read = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)
    
    class Meta:
        ordering = ['date']
        verbose_name_plural = "Message"

    def __str__(self):
        return f"{self.sender} - {self.reciever}"

    @property
    def sender_profile(self):
        sender_profile = Profile.objects.get(user=self.sender)
        return sender_profile
    @property
    def reciever_profile(self):
        reciever_profile = Profile.objects.get(user=self.reciever)
        return reciever_profile

class Counter(models.Model):
    user = models.OneToOneField(User, on_delete=models.CASCADE)
    messageCount = models.IntegerField(default=0)
    notificationCount = models.IntegerField(default=0)
     
# Availability dates of therapists
class TherapistAvailability(models.Model):
    therapist = models.ForeignKey(User, on_delete=models.CASCADE)
    date = models.DateField()
    start_time = models.TimeField()
    end_time = models.TimeField()
    is_available = models.BooleanField(default=True)

    def __str__(self):
        return f"{self.therapist} - {self.date} {self.start_time}-{self.end_time}"

# Booking an Appointment
class Appointments(models.Model):
    date_available = models.ForeignKey(TherapistAvailability, on_delete= models.CASCADE)
    patient = models.ForeignKey(User, on_delete=models.CASCADE)
    room = models.URLField(unique=True)
    host = models.URLField(unique=True)
    meeting_id = models.CharField(max_length=20)
    roomName = models.CharField(max_length=50)
    startDate = models.CharField(max_length=50)
    endDate = models.CharField(max_length=50)
    def __str__(self):
        return f"{self.date_available.therapist} - {self.patient} - \
                    {self.meeting_id} - {self.date_available.date} - \
                    {self.date_available.start_time} - {self.date_available.end_time} - \
                    {self.room} - {self.host}"

# Insight about every room created by an appointment
class RoomInsights(models.Model):
    room_name = models.CharField(max_length=255)
    created_at = models.DateTimeField()
    end_at = models.DateTimeField()
    first_session_started_at = models.DateTimeField()
    last_session_started_at = models.DateTimeField()
    total_participant_minutes = models.IntegerField()
    total_recorder_minutes = models.IntegerField()
    total_streamer_minutes = models.IntegerField()
    total_unique_participants = models.IntegerField()
    total_unique_recorders = models.IntegerField()
    total_unique_streamers = models.IntegerField()
    total_sessions = models.IntegerField()

    def __str__(self):
        return self.room_name
    
# Notification model
class Notification(models.Model):
    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name="therapist")
    patient = models.ForeignKey(User, on_delete= models.CASCADE, related_name="patient")
    title = models.CharField(max_length=100)
    therapistContent = models.CharField(max_length=1000)
    patientContent = models.CharField(max_length=1000)
    sent_at = models.DateTimeField(auto_now_add=True)
    
# Ratings given by a patient for therapist
class Review(models.Model):
     
    THERAPIST_RATINGS = [
        (1, '1'),
        (2, '2'),
        (3, '3'),
        (4, '4'),
        (5, '5')
    ]

    therapist = models.ForeignKey(Therapist, on_delete = models.CASCADE, related_name = 'reviews')
    name = models.CharField(max_length = 20)
    description = models.TextField()
    rating = models.IntegerField(choices = THERAPIST_RATINGS)
    
    def __str__(self):
        return f"{self.therapist.profile.user.email}"

    
class StatusRecord(models.Model):
    patient = models.ForeignKey(User, on_delete=models.CASCADE, related_name= "patientRecord")
    date = models.DateField(auto_now_add=True)
    note = models.TextField()
    therapist_name = models.CharField(max_length = 255)
    prescription = models.ImageField(null = True, blank = True, upload_to="prescriptions")
    
    