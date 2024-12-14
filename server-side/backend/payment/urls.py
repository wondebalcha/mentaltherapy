from django.urls import path
from payment.views import initialize_chapa_transaction, ChapaPaymentVerifier, \
                            TherapistTransaction, PatientTransaction
from rest_framework.routers import DefaultRouter

router = DefaultRouter()
router.register(r'therapist/(?P<therapist_id>\d+)/credited', TherapistTransaction, basename='therapist-transactions')
router.register(r'patient/(?P<patient_id>\d+)/debited', PatientTransaction, basename='patient-transactions')


urlpatterns = router.urls + [
    # Other URL patterns
    path('initialize-chapa-transaction/', initialize_chapa_transaction, name='initialize_chapa_transaction'),
    path('verify-payment/<str:tx_ref>/', ChapaPaymentVerifier.as_view(), name='verify_payment'),
]
