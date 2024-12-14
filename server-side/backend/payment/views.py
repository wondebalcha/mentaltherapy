import requests
from django.http import JsonResponse, HttpResponseRedirect
from django.views.decorators.csrf import csrf_exempt
from django.views import View
from django.conf import settings
from django.utils import timezone
from payment.models import ChapaTransaction
from communication.models import Notification
from payment.serializer import ChapaTransactionSerializer
from core.models import Patient, Profile, Therapist, User
from rest_framework.permissions import AllowAny, IsAuthenticated
import json
import uuid
from rest_framework import viewsets


chapa_api_url = settings.CHAPA_API_URL
chapa_api_secret = settings.CHAPA_SECRET
verification_url = settings.VERIFICATION_URL

@csrf_exempt
def initialize_chapa_transaction(request):
    if request.method == 'POST':
        # Extract payload from the POST request
        try:
            payload = json.loads(request.body)
        except json.JSONDecodeError:
            return JsonResponse({'error': 'Invalid JSON payload'}, status=400)

        user_id = payload['user_id']
        patient = User.objects.get(id=user_id)
        therapist_id = payload['therapist_id']
        therapist = User.objects.get(id=therapist_id)
        therapists = Therapist.objects.get(profile__user_id = therapist_id)
        therapistFirstName = therapists.profile.first_name
        therapistLastName = therapists.profile.last_name      
        amount = therapists.paymentRate
        # Manipulate payload to fill attributes manually
        tx_ref = str(uuid.uuid4())
        return_url = f'{verification_url}{tx_ref}/'
        payment_title = f'Therapy Session'
        description = f'Payment made for {therapistFirstName} {therapistLastName} for undergoing mental treatment.'
        payload['amount'] = amount
        payload['tx_ref'] = tx_ref  
        payload['currency'] = 'ETB'
        payload['return_url'] = return_url  
        payload['payment_title'] = payment_title
        payload['description'] = description

        headers = {
            'Content-Type': 'application/json',
            'Authorization': f'Bearer {chapa_api_secret}',
        }
        # Send request to Chapa API to initialize transaction
        response = requests.post(chapa_api_url, json=payload, headers=headers)
        data = response.json()
        

        if response.status_code == 200:
            # Transaction initialized successfully, store details in the database
            transaction_data = {
                'id': tx_ref,
                'amount': payload['amount'],
                'currency': payload['currency'],
                'patient': patient,
                'therapist': therapist,
                'payment_title': payload.get('payment_title', 'Payment'),
                'description': payload.get('description', ''),
                'status': 'pending',  # Assuming initial status is 'created'
                'response_dump': data,  # Store Chapa API response
                'checkout_url': data.get('data', {}).get('checkout_url'),  # Store checkout URL if available
                # Add other fields as needed
            }
            # Create a new ChapaTransaction instance
            chapa_transaction = ChapaTransaction.objects.create(**transaction_data)

            # Return success response with transaction ID
            return JsonResponse(data)

        else:
            # Failed to initialize transaction, return error response
            error_message = data.get('error', 'Unknown error occurred')
            return JsonResponse({'error': f'Failed to initialize transaction: {error_message}'}, status=response.status_code)

    else:
        return JsonResponse({'error': 'Method not allowed'}, status=405)


class ChapaPaymentVerifier(View):
    def get(self, request, tx_ref):
        url = f"https://api.chapa.co/v1/transaction/verify/{tx_ref}"
        headers = {
            'Authorization': f'Bearer {settings.CHAPA_SECRET}'
        }
        try:
            response = requests.get(url, headers=headers)
            data = response.json()
            if response.status_code == 200:
                # Update ChapaTransaction instance based on verification result
                transaction = ChapaTransaction.objects.get(id=tx_ref)
                transaction.status = data.get('status')
                transaction.updated_at = timezone.now()
                transaction.save()
                
                patient_id = transaction.patient.profile.user_id
                
                patient = Patient.objects.get(profile__user_id=patient_id)
                patient.has_paid = True  
                patient.save()
                
                therapist_id = transaction.therapist.profile.user_id

                therapist = Therapist.objects.get(profile__user_id=therapist_id)
                therapist.totalBalance += transaction.amount
                therapist.save()
                
                # Create a notification instance for both therapist and patient
                patients = User.objects.get(id=patient_id)
                therapists = User.objects.get(id=therapist_id)
                title = f"Payment made by {patients.username} "
                therapistContent = f"{patients.username} has made a payment of amount {transaction.amount} \
                                        ETB for a therapy session with you."
                patientContent = f"You have successfully made an payment of amount {transaction.amount} ETB \
                                        for a therapy session with {therapists.username}. Now, you can schedule an appoinment."
                
                Notification.objects.create(
                    therapist=therapists,
                    patient=patients,
                    title=title,
                    therapistContent= therapistContent,
                    patientContent = patientContent
                )
                
            return HttpResponseRedirect(f'http://localhost:3000/viewtherapist/{therapist_id}')
        except Exception as e:
            return HttpResponseRedirect('http://localhost:3000/')
        

class TherapistTransaction(viewsets.ModelViewSet):
    queryset = ChapaTransaction.objects.all()
    serializer_class = ChapaTransactionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        therapist_id = self.kwargs.get('therapist_id')
        
        # Filter transactions based on therapist ID
        queryset = ChapaTransaction.objects.filter(therapist=therapist_id)
        
        return queryset

    def get_object(self):
        transaction_id = self.kwargs.get('pk')
        
        # Retrieve single transaction based on its ID
        try:
            transaction = ChapaTransaction.objects.get(pk=transaction_id)
        except ChapaTransaction.DoesNotExist:
            raise Http404("Transaction not found")
        
        return transaction
    
class PatientTransaction(viewsets.ModelViewSet):
    queryset = ChapaTransaction.objects.all()
    serializer_class = ChapaTransactionSerializer
    permission_classes = [AllowAny]
    
    def get_queryset(self):
        patient_id = self.kwargs.get('patient_id')
        
        # Filter transactions based on patient ID
        queryset = ChapaTransaction.objects.filter(patient=patient_id)
        
        return queryset

    def get_object(self):
        transaction_id = self.kwargs.get('pk')
        
        # Retrieve single transaction based on its ID
        try:
            transaction = ChapaTransaction.objects.get(pk=transaction_id)
        except ChapaTransaction.DoesNotExist:
            raise Http404("Transaction not found")
        
        return transaction