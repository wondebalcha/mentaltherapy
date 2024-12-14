from django.db import models
from core.models import User, Patient, Therapist
from uuid import uuid4

# Create your models here.

class ChapaStatus(models.TextChoices):
    CREATED = 'created', 'CREATED'
    PENDING = 'pending', 'PENDING'
    SUCCESS = 'success', 'SUCCESS'
    FAILED = 'failed', 'FAILED'

class ChapaTransaction(models.Model):
    "inherit this model and add your own extra fields"
    id = models.CharField(max_length=100, primary_key=True, default=1)

    patient = models.ForeignKey(User, on_delete= models.CASCADE, related_name="patientPayment")
    therapist = models.ForeignKey(User, on_delete=models.CASCADE, related_name="therapistPayment")
    amount = models.FloatField()
    currency = models.CharField(max_length=25, default='ETB')

    payment_title = models.CharField(max_length=255, default='Payment')
    description = models.TextField(blank= True)

    status = models.CharField(max_length=50, choices=ChapaStatus.choices, default=ChapaStatus.CREATED)

    response_dump = models.JSONField(default=dict, blank=True)  # incase the response is valuable in the future
    checkout_url = models.URLField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add= True)
    updated_at = models.DateTimeField(null=True)

