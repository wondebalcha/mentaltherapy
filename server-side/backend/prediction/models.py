from django.db import models
from core.models import Patient
# Create your models here.

class Questionaries(models.Model):
     
     
     
     #patient = models.ForeignKey(Patient)
     age = models.IntegerField()
     q1 = models.IntegerField( )
     q2 = models.IntegerField( )
     q3 = models.IntegerField( )
     q4 = models.IntegerField( )
     q5 = models.IntegerField( )
     q6 = models.IntegerField( )
     q7 = models.IntegerField( )
     q8 = models.IntegerField( )
     q9 = models.IntegerField( )
     q10 = models.IntegerField( )
     q11 = models.IntegerField( )
     q12 = models.IntegerField( )
     q13 = models.IntegerField( )
     q14 = models.IntegerField( )
     q15 = models.IntegerField( )
     q16 = models.IntegerField( )
     q17 = models.IntegerField( )
     q18 = models.IntegerField( )
     q19 = models.IntegerField( )
     q20 = models.IntegerField( )
     q21 = models.IntegerField( )
     q22 = models.IntegerField( )
     q23 = models.IntegerField( )
     q24 = models.IntegerField( )
     q25 = models.IntegerField( )
     q26 = models.IntegerField( )
     q27 = models.IntegerField( )

     #result = models.CharField(max_length=255, blank=True, null=True)
    







class PredictedValues(models.Model):
    patient = models.ForeignKey(Patient, on_delete= models.CASCADE)
    predicted_at = models.DateTimeField(auto_now_add = True)
    predicted_result = models.CharField(max_length = 20)
















    