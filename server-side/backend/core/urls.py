from django.urls import path
from . import views


from rest_framework_simplejwt.views import (
    TokenRefreshView,
)
from rest_framework.routers import DefaultRouter

""" router = DefaultRouter()
router.register(r'profile-update/(?P<therapist_id>\d+)/', \
                    views.ProfileUpdate, basename='p') """

urlpatterns = [
    path('token/', views.MyTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path('register-therapist/', views.TherapistRegisterView.as_view(), name='therapist_register'),
    path('register-patient/', views.PatientRegisterView.as_view(), name='patient_register'),
    path('verify-email/<uidb64>/<token>/', views.VerifyEmailView.as_view(), name='verify_email'),
    path('forgot-password/', views.ForgotPasswordView.as_view(), name='forgot_password'),
    path('reset-password/<uidb64>/<token>/', views.ResetPasswordView.as_view(), name='reset_password'),
    path('change-password/<int:user_id>/', views.ChangePasswordView.as_view(), name='change_password'),
    path('profile-update/<int:user_id>/', views.ProfileUpdate.as_view(), name='profile_image_update'),
    path('therapists/', views.TherapistDetailViews.as_view(), name='therapist_detail'),
    path('therapists/<int:user_id>/', views.TherapistDetailView.as_view(), name='therapist_detail'),
    path('patients/', views.PatientDetailViews.as_view(), name='patient_detail'),
    path('patients/<int:user_id>/', views.PatientDetailView.as_view(), name='patient_detail'),
    path('', views.getRoutes),
    
    # Feedback
    path('feedback/', views.FeedbackView.as_view(), name='client-feedback'),

    # Get profile
    path("profile/<int:pk>/", views.ProfileDetail.as_view()),
    path("search/<username>/", views.SearchUser.as_view()),

]