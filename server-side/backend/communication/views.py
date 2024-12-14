from django.shortcuts import render, get_object_or_404
from django.http import JsonResponse, Http404
from django.db.models import OuterRef, Subquery, Q
from django.db.models.aggregates import Avg
from django.db.models.signals import post_save, post_delete
from django.dispatch import receiver
from django.utils import timezone
from django.conf import settings

from rest_framework import viewsets, status, generics, mixins
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.decorators import api_view, permission_classes
from rest_framework.exceptions import ValidationError
from rest_framework.views import APIView
from rest_framework.authentication import TokenAuthentication

from communication.models import ChatMessage, Counter, TherapistAvailability, Appointments, \
                                    RoomInsights, Notification, Review, StatusRecord

from communication.serializer import MessageSerializer, TherapistAvailabilitySerializer, \
                                        AppointmentsSerializer, RoomInsightsSerializer, \
                                        NotificationSerializer, ReviewSerializer, CounterSerializer, \
                                        StatusRecordSerializer

from core.models import User, Profile, Patient, Therapist
from core.serializer import UserSerializer, ProfileSerializer, PatientSerializer, TherapistSerializer

from payment.models import ChapaTransaction

from datetime import date, datetime
import requests, json



API_KEY = settings.WHEREBY_API

# Create your views here.
@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/session',
        '/api/register/',
        '/api/token/refresh/'
    ]
    return Response(routes)

#Chat APP
class MyInbox(generics.ListAPIView):
    serializer_class = MessageSerializer

    def get_queryset(self):
        user_id = self.kwargs['user_id']

        messages = ChatMessage.objects.filter(
            id__in =  Subquery(
                User.objects.filter(
                    Q(sender__reciever=user_id) |
                    Q(reciever__sender=user_id)
                ).distinct().annotate(
                    last_msg=Subquery(
                        ChatMessage.objects.filter(
                            Q(sender=OuterRef('id'),reciever=user_id) |
                            Q(reciever=OuterRef('id'),sender=user_id)
                        ).order_by('-id')[:1].values_list('id',flat=True) 
                    )
                ).values_list('last_msg', flat=True).order_by("-id")
            )
        ).order_by("-id")
            
        return messages
    
class GetMessages(generics.ListAPIView):
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        sender_id = self.kwargs['sender_id']
        reciever_id = self.kwargs['reciever_id']
        messages =  ChatMessage.objects.filter(sender__in=[sender_id, reciever_id], \
                                                reciever__in=[sender_id, reciever_id])
        return messages

class SendMessages(generics.CreateAPIView):
    serializer_class = MessageSerializer


class GetAllMessages(generics.ListAPIView):
    serializer_class = MessageSerializer
    
    def get_queryset(self):
        user_id = self.kwargs['user_id']
        
        messages =  ChatMessage.objects.filter(Q(reciever__id=user_id))
                
        return messages

class ReadMessage(generics.RetrieveUpdateAPIView):
    serializer_class = MessageSerializer 
    
    def get_object(self):
        user_id = self.kwargs['user_id']
        
        messages =  ChatMessage.objects.get(id=user_id)
                
        return messages 
    
class CounterView(generics.RetrieveUpdateAPIView):
    serializer_class = CounterSerializer

    def get_object(self):
        user_id = self.kwargs['user_id']
        try:
            count = Counter.objects.get(user_id=user_id)
        except Counter.DoesNotExist:
            # If no MessageCount object exists for the user, create one with count=0
            count = Counter.objects.create(user_id=user_id, messageCount=0, notificationCount=0)
        return count

    def retrieve(self, request, *args, **kwargs):
        instance = self.get_object()
        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)
##############################################################################

#Booking Appointment        
class TherapistAvailabilityViewSet(viewsets.ModelViewSet):
    queryset = TherapistAvailability.objects.all()
    serializer_class = TherapistAvailabilitySerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        therapist_id = self.kwargs.get('therapist_id')
        today = timezone.now().date()
        if therapist_id:
            
            queryset = TherapistAvailability.objects.filter(therapist=therapist_id)

            # Filter out dates that have appointments
            used_dates = set(TherapistAvailability.objects.filter(appointments__isnull=False).values_list('pk', flat=True))
            queryset = queryset.exclude(pk__in=used_dates)
            
            # Filter out dates and times that are past today
            past_availability = queryset.filter(date__lt=today)
            
            # Delete the past availability
            past_availability.delete()

            # Return the queryset without past availability
            queryset = queryset.exclude(pk__in=past_availability.values_list('pk', flat=True))

            return queryset
    
    def create(self, request, *args, **kwargs):
        # Ensure date is not in the past
        date_str = request.data.get('date')
        if date_str:
            date = datetime.strptime(date_str, '%Y-%m-%d').date()
            if date < timezone.now().date():
                raise ValidationError("Cannot create availability in the past.")

        return super().create(request, *args, **kwargs)
    

    def get_object(self):
        therapistAvailability_id = self.kwargs.get('pk')
        
        try:
            availability = TherapistAvailability.objects.get(pk=therapistAvailability_id)
        except TherapistAvailability.DoesNotExist:
            raise Http404("Available date not found")
        
        return availability
        
#######################################################################################################
# APPOINTMENTS #   
class TherapistAppointments(viewsets.ModelViewSet):
    queryset = Appointments.objects.all()
    serializer_class = AppointmentsSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        therapist_id = self.kwargs.get('therapist_id')
        today = timezone.now().date()
        queryset = Appointments.objects.filter(date_available__therapist=therapist_id)
        
        # Filter out appointments that are in the past
        queryset = queryset.filter(date_available__date__gte=today)
        
        if not queryset.exists():
            raise Http404("Appointment not found")
        
        return queryset

    def get_object(self):
        appointment_id = self.kwargs.get('pk')
        
        try:
            appointment = Appointments.objects.get(pk=appointment_id)
        except Appointments.DoesNotExist:
            raise Http404("Appointment not found")
        
        return appointment
    
class PatientAppointments(viewsets.ModelViewSet):
    queryset = Appointments.objects.all()
    serializer_class = AppointmentsSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        today = timezone.now().date()
        # Filter appointments based on patient ID
        queryset = Appointments.objects.filter(patient=patient_id)
        # Filter out appointments that are in the past
        queryset = queryset.filter(date_available__date__gte=today)
        
        if not queryset.exists():
            raise Http404("Appointment not found")
        
        return queryset

    def get_object(self):
        # Retrieve appointment ID from URL parameter
        appointment_id = self.kwargs.get('pk')
        
        # Retrieve single appointment based on its ID
        try:
            appointment = Appointments.objects.get(pk=appointment_id)
        except Appointments.DoesNotExist:
            raise Http404("Appointment not found")
        
        return appointment
    
class AppointmentsViewSet(generics.CreateAPIView):
    queryset = Appointments.objects.all()
    serializer_class = AppointmentsSerializer
    permission_classes = [AllowAny]
    
    def create(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        patients = serializer.validated_data['patient']
        patient_id = patients.id
        patient = Patient.objects.get(profile__user_id=patient_id)
        if not patient.has_paid:
            return Response({"message": "Patient has not paid. Appointment cannot be created."},
                            status=status.HTTP_400_BAD_REQUEST)
        therapist = serializer.validated_data['date_available'].therapist
        therapist_id = therapist.id
        patientUser = User.objects.get(id=patient_id)
        therapistUser = User.objects.get(id=therapist_id)
        
        # check if the patient paid for that therapist or not
        # So a patient can book an appointment to the therapist he paid for only
        if not ChapaTransaction.objects.filter(patient=patientUser, therapist=therapistUser).exists():
            return Response({"message": "You are not authorized to make an appointment with this therapist."},
                status=status.HTTP_403_FORBIDDEN)
        
        if patient.has_paid:
            self.perform_create(serializer)
            headers = self.get_success_headers(serializer.data)
            return Response(serializer.data, status=status.HTTP_201_CREATED, headers=headers)

    def perform_create(self, serializer):    
        # Logic to create a room using Whereby API
        data = {
            "isLocked" : True,
            "endDate": "2099-02-18T14:23:00.000Z",
            "fields": ["hostRoomUrl"],
        }
        headers = {
            "Authorization": f"Bearer {API_KEY}",
            "Content-Type": "application/json",
        }
        response = requests.post(
            "https://api.whereby.dev/v1/meetings",
            headers=headers,
            json=data
        )
        data = json.loads(response.text)
        room_url = data["roomUrl"]
        host_room = data["hostRoomUrl"]
        meeting_id = data["meetingId"]
        roomName = data["roomName"]
        startDate = data["startDate"]
        endDate = data["endDate"]
        serializer.save(room=room_url, host=host_room, meeting_id=meeting_id, \
                        roomName=roomName, startDate = startDate, endDate = endDate)
        
class RoomInsightsAPIView(APIView):
    def get(self, request):
        API_ENDPOINT = "https://api.whereby.dev/v1/insights/rooms"

        headers = {
            "Authorization": f"Bearer {API_KEY}"
        }

        try:
            response = requests.get(API_ENDPOINT, headers=headers)
            response.raise_for_status() 

            data = response.json()

            # Save or update room insights in the database
            for room_data in data['results']:
                room_name = room_data.get('roomName')
                created_at = room_data.get('createdAt')
                end_at = room_data.get('endAt')
                first_session_started_at = room_data.get('firstSessionStartedAt')
                last_session_started_at = room_data.get('lastSessionStartedAt')
                total_participant_minutes = room_data.get('totalParticipantMinutes')
                total_recorder_minutes = room_data.get('totalRecorderMinutes')
                total_streamer_minutes = room_data.get('totalStreamerMinutes')
                total_unique_participants = room_data.get('totalUniqueParticipants')
                total_unique_recorders = room_data.get('totalUniqueRecorders')
                total_unique_streamers = room_data.get('totalUniqueStreamers')
                total_sessions = room_data.get('totalSessions')

                # Create or update room insights
                room_insights, created = RoomInsights.objects.update_or_create(
                    room_name=room_name,
                    defaults={
                        'created_at': created_at,
                        'end_at': end_at,
                        'first_session_started_at': first_session_started_at,
                        'last_session_started_at': last_session_started_at,
                        'total_participant_minutes': total_participant_minutes,
                        'total_recorder_minutes': total_recorder_minutes,
                        'total_streamer_minutes': total_streamer_minutes,
                        'total_unique_participants': total_unique_participants,
                        'total_unique_recorders': total_unique_recorders,
                        'total_unique_streamers': total_unique_streamers,
                        'total_sessions': total_sessions
                    }
                )
            # Serialize room insights data
            serializer = RoomInsightsSerializer(RoomInsights.objects.all(), many=True)
            return Response(serializer.data)
        except requests.RequestException as e:
            return Response({"error": str(e)}, status=500)
        
###############################################################################
# Notification for a booked Appointment 
@receiver(post_save, sender=Appointments)
def create_notification(sender, instance, created, **kwargs):
    if created:
        # Get the therapist and patient from the appointment
        therapist = instance.date_available.therapist
        patient = instance.patient
        appointment_date = instance.date_available.date

        # Create the notification
        title = "New Appointment Booked"
        therapistContent = f"A new appointment has been booked by {patient.username} for {appointment_date}."
        patientContent = f"You have successfully booked an appointment with {therapist.username} on {appointment_date}."
        
        Notification.objects.create(
            therapist=therapist,
            patient=patient,
            title=title,
            therapistContent= therapistContent,
            patientContent = patientContent
        )

# Notification for a canceled Appointment
@receiver(post_delete, sender=Appointments)
def delete_notification(sender, instance, **kwargs):
    # Get the therapist and patient from the appointment
    therapist = instance.date_available.therapist
    patient = instance.patient
    
    appointment_date = instance.date_available.date
    
    # Create content for notification
    title = "Appointment Canceled"
    therapistContent = f"The appointment with {patient.username} scheduled for {appointment_date} has been canceled."
    patientContent = f"You have successfully canceled an appointment with {therapist.username} scheduled for {appointment_date}."
    
    Notification.objects.create(
        therapist=therapist,
        patient=patient,
        title=title,
        therapistContent= therapistContent,
        patientContent = patientContent
    )
    
# Therapists Notifications View and CRUD
class TherapistNotification(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        therapist_id = self.kwargs.get('therapist_id')
        if therapist_id:
            queryset = Notification.objects.filter(therapist=therapist_id)
            queryset = queryset.order_by('-sent_at')
           
            return queryset
      

    def get_object(self):
        notification_id = self.kwargs.get('pk')
        
        try:
            notification = Notification.objects.get(pk=notification_id)
        except Notification.DoesNotExist:
            raise Http404("Notification not found")
        
        return notification
    
# Patients Notifications View and CRUD
class PatientNotification(viewsets.ModelViewSet):
    queryset = Notification.objects.all()
    serializer_class = NotificationSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        if patient_id:
            queryset = Notification.objects.filter(patient=patient_id)
            queryset = queryset.order_by('-sent_at')
           
            return queryset
      

    def get_object(self):
        notification_id = self.kwargs.get('pk')
        
        try:
            notification = Notification.objects.get(pk=notification_id)
        except Notification.DoesNotExist:
            raise Http404("Notification not found")
        
        return notification
    
# Review given for therapists
class ReviewView(generics.ListCreateAPIView, generics.RetrieveUpdateDestroyAPIView):
    serializer_class = ReviewSerializer
    lookup_field = 'id'

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        try:
            therapist = Therapist.objects.get(profile__user_id=user_id)
        except Therapist.DoesNotExist:
            raise Http404('Therapist not found')
        return Review.objects.filter(therapist=therapist)

    def get_serializer_context(self):
        user_id = self.kwargs.get('user_id')
        try:
            therapist = Therapist.objects.get(profile__user_id=user_id)
            return {'therapist_id': therapist.id}
        except Therapist.DoesNotExist:
            return {}

    def get_object(self):
        queryset = self.get_queryset()
        obj = queryset.get(id=self.kwargs['id'])
        self.check_object_permissions(self.request, obj)
        return obj
    
@receiver(post_save, sender=Review)
def update_average_rating(sender, instance, **kwargs):
    therapist = instance.therapist
    reviews = Review.objects.filter(therapist=therapist)
    average_rating = reviews.aggregate(Avg('rating'))['rating__avg']
    therapist.rating = average_rating
    therapist.save()
    
    
class StatusRecordViewSet(viewsets.ModelViewSet):
    serializer_class = StatusRecordSerializer
    permission_classes =[AllowAny]

    def get_queryset(self):
        user_id = self.kwargs.get('patient_id')
        if user_id: 
            queryset = StatusRecord.objects.filter(patient=user_id)

            return queryset
    
    def get_object(self):
        record_id = self.kwargs.get('pk')
        
        try:
            record = StatusRecord.objects.get(pk=record_id)
        except StatusRecord.DoesNotExist:
            raise Http404("Record not found")
        
        return record