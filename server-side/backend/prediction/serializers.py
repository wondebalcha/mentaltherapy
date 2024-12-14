from rest_framework import serializers
from .models import Questionaries, PredictedValues

class PredictionSerializer(serializers.ModelSerializer):
    class Meta:
        model = Questionaries
        fields =  ['age', 'q1', 'q2', 'q3', 'q4', 'q5', 'q6', 'q7', 'q8', 'q9', 'q10',
                    'q11', 'q12', 'q13', 'q14', 'q15', 'q16', 'q17', 'q18', 'q19', 'q20',
                    'q21', 'q22', 'q23', 'q24', 'q25', 'q26', 'q27']
        
class PredictedValueSerializer(serializers.ModelSerializer):
    class Meta:
        model = PredictedValues
        fields = ['patient_id', 'predicted_at', 'predicted_result']