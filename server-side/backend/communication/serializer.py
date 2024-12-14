from rest_framework import serializers
from core.serializer import ProfileSerializer
from core.models import Therapist, User, Profile, Patient
from communication.models import ChatMessage, TherapistAvailability, Appointments, RoomInsights, \
                                    Notification, Review, Counter, StatusRecord

#Chat APP
class MessageSerializer(serializers.ModelSerializer):
    reciever_profile = ProfileSerializer(read_only=True)
    sender_profile = ProfileSerializer(read_only=True)

    class Meta:
        model = ChatMessage
        fields = ['id','sender', 'reciever', 'reciever_profile', \
                    'sender_profile' ,'message', 'is_read', 'date']
    
    def __init__(self, *args, **kwargs):
        super(MessageSerializer, self).__init__(*args, **kwargs)
        request = self.context.get('request')
        if request and request.method=='POST':
            self.Meta.depth = 0
        else:
            self.Meta.depth = 2
            
class CounterSerializer(serializers.ModelSerializer):
    class Meta:
        model = Counter
        fields = '__all__'
            
#Booking Appointment
class TherapistAvailabilitySerializer(serializers.ModelSerializer):
    therapist_first_name = serializers.SerializerMethodField()
    therapist_last_name = serializers.SerializerMethodField()
    therapist = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    therapistID = serializers.SerializerMethodField()
    
    class Meta:
        model = TherapistAvailability
        fields = ['id', 'therapist','therapistID', 'therapist_first_name', \
                    'therapist_last_name', 'date', 'start_time', 'end_time']

    def get_therapist_first_name(self, obj):
        therapist_id = obj.therapist
        therapists = Profile.objects.get(user_id=therapist_id)
        return therapists.first_name if therapists else ""

    def get_therapist_last_name(self, obj):
        therapist_id = obj.therapist
        therapists = Profile.objects.get(user_id=therapist_id)
        return therapists.last_name if therapists else ""
    
    def get_therapistID(self, obj):
        therapist_id = obj.therapist
        therapists = Profile.objects.get(user_id=therapist_id)
        return therapists.user_id if therapists else ""

class AppointmentsSerializer(serializers.ModelSerializer):
    room = serializers.CharField(read_only=True)
    host = serializers.CharField(read_only=True)
    meeting_id = serializers.CharField(read_only=True)
    roomName = serializers.CharField(read_only=True)
    startDate = serializers.CharField(read_only=True)
    endDate = serializers.CharField(read_only=True)
    date_available = serializers.PrimaryKeyRelatedField(queryset=TherapistAvailability.objects.all(), \
                                                            write_only=True)
    date = serializers.SerializerMethodField()
    start_time = serializers.SerializerMethodField()
    end_time = serializers.SerializerMethodField()
    therapist_first_name = serializers.SerializerMethodField()
    therapist_last_name = serializers.SerializerMethodField()
    therapistID = serializers.SerializerMethodField()
    patient_first_name = serializers.SerializerMethodField()
    patient_last_name = serializers.SerializerMethodField()
    patient = serializers.PrimaryKeyRelatedField(queryset=User.objects.all(), write_only=True)
    patientID = serializers.SerializerMethodField()
    class Meta:
        model = Appointments
        fields = ['id', 'patient', 'date_available','date','start_time','end_time', \
                    'therapist_first_name','therapist_last_name','therapistID', \
                    'patient_first_name','patient_last_name','patientID', 'room', \
                    'host','meeting_id', 'roomName', 'startDate', 'endDate']
    
    def get_date(self, obj):
        availability_id = obj.date_available.id
        availability = TherapistAvailability.objects.get(id=availability_id)
        return availability.date if availability else ""
    
    def get_start_time(self, obj):
        availability_id = obj.date_available.id
        availability = TherapistAvailability.objects.get(id=availability_id)
        return availability.start_time if availability else ""
    
    def get_end_time(self, obj):
        availability_id = obj.date_available.id
        availability = TherapistAvailability.objects.get(id=availability_id)
        return availability.end_time if availability else ""
    
    def get_therapist_first_name(self, obj):
        availability_id = obj.date_available.id
        availability = TherapistAvailability.objects.get(id=availability_id)
        therapist_id = availability.therapist
        therapists = Profile.objects.get(user_id=therapist_id)
        return therapists.first_name if therapists else ""
    
    def get_therapist_last_name(self, obj):
        availability_id = obj.date_available.id
        availability = TherapistAvailability.objects.get(id=availability_id)
        therapist_id = availability.therapist
        therapists = Profile.objects.get(user_id=therapist_id)
        return therapists.last_name if therapists else ""
    
    def get_therapistID(self, obj):
        availability_id = obj.date_available.id
        availability = TherapistAvailability.objects.get(id=availability_id)
        therapist_id = availability.therapist
        therapists = Profile.objects.get(user_id=therapist_id)
        return therapists.user_id if therapists else ""
    
    def get_patient_first_name(self, obj):
        patient_id = obj.patient
        patients = Profile.objects.get(user_id=patient_id)
        return patients.first_name if patients else ""

    def get_patient_last_name(self, obj):
        patient_id = obj.patient
        patients = Profile.objects.get(user_id=patient_id)
        return patients.last_name if patients else ""
    
    def get_patientID(self, obj):
        patient_id = obj.patient
        patients = Profile.objects.get(user_id=patient_id)
        return patients.user_id if patients else ""
    
class RoomInsightsSerializer(serializers.ModelSerializer):
    class Meta:
        model = RoomInsights
        fields = '__all__'
        
class NotificationSerializer(serializers.ModelSerializer):
    class Meta:
        model = Notification
        fields = '__all__'
        
class ReviewSerializer(serializers.ModelSerializer):
    class Meta:
        model =Review
        fields = ['id', 'name', 'description',  'rating']
    def create(self, validated_data):
         therapist_id = self.context['therapist_id']
         return Review.objects.create(therapist_id = therapist_id, **validated_data )
     

class StatusRecordSerializer(serializers.ModelSerializer):
    class Meta:
        model = StatusRecord
        fields = '__all__'