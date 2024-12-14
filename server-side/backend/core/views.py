from django.shortcuts import render, redirect, get_object_or_404
from django.http import Http404, JsonResponse, HttpResponseRedirect
from django.db.models import OuterRef, Subquery
from django.db.models import Q

from core.models import User, Profile, Patient, Therapist, Feedback

from core.serializer import MyTokenObtainPairSerializer, RegisterSerializer, ProfileSerializer, \
                                UserSerializer, PatientSerializer, TherapistSerializer, \
                                    ProfileUpdateSerializer, ChangePasswordSerializer, FeedbackSerializer

from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework import generics, viewsets
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework import status
from rest_framework.views import APIView
from rest_framework.decorators import api_view, permission_classes

from django.contrib.auth.tokens import default_token_generator
from django.utils.http import urlsafe_base64_encode, urlsafe_base64_decode
from django.utils.encoding import force_bytes, force_str
from django.contrib.auth import get_user_model
from mailjet_rest import Client
from .tokens import email_verification_token

from django.conf import settings


class MyTokenObtainPairView(TokenObtainPairView):
    serializer_class = MyTokenObtainPairSerializer

User = get_user_model()

class SendVerificationEmail:
    @staticmethod
    def send(user):
        token = email_verification_token.make_token(user)
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        verification_link = f"http://localhost:3000/verify-email/{uid}/{token}/"

        html_content = f"""
        <p>Hi {user.username},</p>
        <p>Please click on the link below to verify your email address:</p>
        <p><a href="{verification_link}">Verify Email</a></p>
        <p>Thank you!</p>
        """

        mailjet = Client(auth=(settings.MAILJET_API_KEY, settings.MAILJET_API_SECRET), version='v3.1')
        data = {
            'Messages': [
                {
                    "From": {
                        "Email": "lenchofikru93@gmail.com",
                        "Name": "Bunna Mind"
                    },
                    "To": [
                        {
                            "Email": user.email,
                            "Name": user.username
                        }
                    ],
                    "Subject": "Email Verification",
                    "TextPart": "Please verify your email address.",
                    "HTMLPart": html_content,
                }
            ]
        }

        result = mailjet.send.create(data=data)
        if result.status_code != 200:
            raise Exception(f"Failed to send verification email: {result.json()}")


class PatientRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = PatientSerializer
    
    def perform_create(self, serializer):
        user = serializer.save().profile.user
        SendVerificationEmail.send(user)

class TherapistRegisterView(generics.CreateAPIView):
    queryset = User.objects.all()
    permission_classes = (AllowAny,)
    serializer_class = TherapistSerializer
    
    def perform_create(self, serializer):
        user = serializer.save().profile.user
        SendVerificationEmail.send(user)
        
class VerifyEmailView(generics.GenericAPIView):
    permission_classes = (AllowAny,)

    def get(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and email_verification_token.check_token(user, token):
            user.is_verified = True
            user.is_active = True  # Optionally activate the user
            user.save()

            if hasattr(user.profile, 'user_type'):
                if user.profile.user_type == 'patient':
                    redirect_url = "http://localhost:3000/login-p"
                elif user.profile.user_type == 'therapist':
                    redirect_url = "http://localhost:3000/login-t"
                else:
                    redirect_url = f"http://localhost:3000/"

           
                return Response({'redirect_url': redirect_url}, status=status.HTTP_200_OK)

        return Response({'error': 'Invalid token'}, status=status.HTTP_400_BAD_REQUEST)
    
class ForgotPasswordView(generics.GenericAPIView):
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
        except User.DoesNotExist:
            return Response({'error': 'User with this email does not exist.'}, status=status.HTTP_400_BAD_REQUEST)
        
        # Generate password reset token
        token = email_verification_token.make_token(user)
        
        # Send password reset email
        uid = urlsafe_base64_encode(force_bytes(user.pk))
        reset_password_link = f"http://localhost:3000/reset-password/{uid}/{token}/"
        
        html_content = f"""
        <p>Hi customer,</p>
        <p>Please click on the link below to reset your password:</p>
        <p><a href="{reset_password_link}">Reset Password</a></p>
        <p>Thank you!</p>
        """
        
        mailjet = Client(auth=(settings.MAILJET_API_KEY, settings.MAILJET_API_SECRET), version='v3.1')
        data = {
            'Messages': [
                {
                    'From': {
                        'Email': 'lenchofikru93@gmail.com',
                        'Name': 'Bunna Mind'
                    },
                    'To': [
                        {
                            'Email': email,
                            'Name': user.username
                        }
                    ],
                    'Subject': 'Password Reset',
                    'TextPart': f'Click the link to reset your password',
                    'HTMLPart': html_content,
                }
            ]
        }
        
        result = mailjet.send.create(data=data)
        
        if result.status_code == 200:
            return Response({'message': 'Password reset link has been sent to your email.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class ResetPasswordView(generics.GenericAPIView):
    def post(self, request, uidb64, token):
        try:
            uid = force_str(urlsafe_base64_decode(uidb64))
            user = User.objects.get(pk=uid)
        except (TypeError, ValueError, OverflowError, User.DoesNotExist):
            user = None

        if user is not None and default_token_generator.check_token(user, token):
            new_password = request.data.get('new_password')
            confirm_new_password = request.data.get('confirm_new_password')

            if new_password != confirm_new_password:
                return Response({'error': 'New passwords do not match.'}, status=status.HTTP_400_BAD_REQUEST)

            user.set_password(new_password)
            user.save()
            return Response({'message': 'Password reset successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Invalid token.'}, status=status.HTTP_400_BAD_REQUEST)


class ChangePasswordView(APIView):
    permission_classes = [AllowAny]

    def post(self, request, user_id, *args, **kwargs):
        serializer = ChangePasswordSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        user = get_object_or_404(User, id=user_id)

        if not user.check_password(serializer.validated_data['old_password']):
            return Response({"old_password": ["Old password is not correct."]}, status=status.HTTP_400_BAD_REQUEST)

        user.set_password(serializer.validated_data['new_password'])
        user.save()

        return Response({"detail": "Password changed successfully."}, status=status.HTTP_200_OK)
    
class TherapistDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Therapist.objects.all()
    serializer_class = TherapistSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        user_id = self.kwargs.get('user_id')

        try:
            therapist = Therapist.objects.get(profile__user_id=user_id)
            return therapist
        except Therapist.DoesNotExist:
            raise Http404
        
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Update specific attributes only
        specific_attributes = {'specialization', 'experience', 'licenses', 'religion'}
        for attr in specific_attributes:
            if attr in request.data:
                setattr(instance, attr, request.data[attr])

        # Update the nested Profile instance
        profile_data = request.data.get('profile', {})
        profile_serializer = ProfileSerializer(instance.profile, data=profile_data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
        else:
            return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response(serializer.data)

## Updating a user image using PUT request
class ProfileUpdate(generics.RetrieveUpdateDestroyAPIView):
    queryset = Profile.objects.all()
    serializer_class = ProfileUpdateSerializer
    permission_classes = [AllowAny]

    def get_object(self):
        user_id = self.kwargs.get('user_id')
        try:
            profile = Profile.objects.get(user_id=user_id)
            return profile
        except Profile.DoesNotExist:
            raise Http404

    def update(self, request, *args, **kwargs):
        profile = self.get_object()
        serializer = self.get_serializer(profile, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        self.perform_update(serializer)
        return Response(serializer.data)

    def perform_update(self, serializer):
        serializer.save()
    
# List of all patients and therapists
class TherapistDetailViews(generics.ListAPIView):
    queryset = Therapist.objects.all()
    serializer_class = TherapistSerializer
    permission_classes = [IsAuthenticated]
        
class PatientDetailViews(generics.ListAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer     
    permission_classes = [IsAuthenticated]   
    
#################################################        

class PatientDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Patient.objects.all()
    serializer_class = PatientSerializer
    permission_classes = [AllowAny]
    
    def get_object(self):
        user_id = self.kwargs.get('user_id')

        try:
            patient = Patient.objects.get(profile__user_id=user_id)
            return patient
        except Patient.DoesNotExist:
            raise Http404
    
    def update(self, request, *args, **kwargs):
        partial = kwargs.pop('partial', False)
        instance = self.get_object()
        serializer = self.get_serializer(instance, data=request.data, partial=partial)
        serializer.is_valid(raise_exception=True)
        
        # Update specific attributes only
        specific_attributes = {'occupation', 'has_paid'}
        for attr in specific_attributes:
            if attr in request.data:
                setattr(instance, attr, request.data[attr])

        # Update the nested Profile instance
        profile_data = request.data.get('profile', {})
        profile_serializer = ProfileSerializer(instance.profile, data=profile_data, partial=True)
        if profile_serializer.is_valid():
            profile_serializer.save()
        else:
            return Response(profile_serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        self.perform_update(serializer)
        return Response(serializer.data)


# Get All Routes

@api_view(['GET'])
def getRoutes(request):
    routes = [
        '/core/token/',
        '/core/register-patient/',
        '/core/register-therapist/',
        '/core/token/refresh/'
    ]
    return Response(routes)




class ProfileDetail(generics.RetrieveUpdateAPIView):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [IsAuthenticated]  

    def get_object(self):
        user_id = self.kwargs.get('pk')

        try:
            profile = Profile.objects.get(user_id=user_id)
            return profile
        except Profile.DoesNotExist:
            raise Http404

class SearchUser(generics.ListAPIView):
    serializer_class = ProfileSerializer
    queryset = Profile.objects.all()
    permission_classes = [IsAuthenticated]  

    def list(self, request, *args, **kwargs):
        username = self.kwargs['username'].strip()
        logged_in_user = self.request.user
        names = username.split()
        
        if not username:  # Check if username is empty after stripping
            return Response(
                {"detail": "No users found."},
                status=status.HTTP_404_NOT_FOUND
            )

        if len(names) == 1:
            # If only one name is provided, search in all relevant fields
            users = Profile.objects.filter(
                (Q(user__username__icontains=username) |
                Q(first_name__icontains=username) |
                Q(last_name__icontains=username) |
                Q(user__email__icontains=username)) &
                ~Q(user=logged_in_user)
            )
        else:
            # If two names are provided, assume the first one is first name and the second one is last name
            first_name = names[0]
            last_name = names[1]
            users = Profile.objects.filter(
                (Q(first_name__icontains=first_name) & Q(last_name__icontains=last_name)) |
                (Q(user__username__icontains=username) |
                Q(user__email__icontains=username)) &
                ~Q(user=logged_in_user)
            )
        

        if not users.exists():
            return Response(
                {"detail": "No users found."},
                status=status.HTTP_404_NOT_FOUND
            )

        serializer = self.get_serializer(users, many=True)
        return Response(serializer.data)

class FeedbackView(APIView):
    def post(self, request):
        email = request.data.get('email')
        first_name = request.data.get('first_name')
        last_name = request.data.get('last_name')
        message = request.data.get('message')
        
        html_content = f"""
        <p>Hello {first_name},</p>
        <p>Thank you for your feedback. We will get back to you soon.</p>
        <p>BunnaMind</p>
        """
        
        mailjet = Client(auth=(settings.MAILJET_API_KEY, settings.MAILJET_API_SECRET), version='v3.1')
        data = {
            'Messages': [
                {
                    'From': {
                        'Email': 'lenchofikru93@gmail.com',
                        'Name': 'Bunna Mind'
                    },
                    'To': [
                        {
                            'Email': email,
                            'Name': first_name
                        }
                    ],
                    'Subject': 'Message Recieved',
                    'TextPart': f'We have received the message you sent us',
                    'HTMLPart': html_content,
                }
            ]
        }
        
        result = mailjet.send.create(data=data)
        
        if result.status_code == 200:
            Feedback.objects.create(
                    first_name=first_name,
                    last_name=last_name,
                    email = email,
                    message=message,
                )
            return Response({'message': 'Your message is recieved successfully.'}, status=status.HTTP_200_OK)
        else:
            return Response({'error': 'Failed to send email.'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)