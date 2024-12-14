from django.shortcuts import render

# Create your views here.
import numpy as np
from rest_framework.generics import ListAPIView
from rest_framework.response import Response
from sklearn.preprocessing import OneHotEncoder
from .serializer import SimpleTherapistSerializer
from core.models import Profile, Therapist, Patient
# Create your views here.


class TherapistRecommendation(ListAPIView):
    serializer_class = SimpleTherapistSerializer

    def get_queryset(self):
        user_id = self.kwargs.get('user_id')
        patient = Patient.objects.select_related('profile').get(profile__user_id = user_id)
        therapists = Therapist.objects.select_related('profile').all()

        
        # starting OneHotEncoder
        encoder = OneHotEncoder(sparse_output=False, handle_unknown='ignore')

        # Extract gender and preferred_language data from therapists
        gender_language_data = np.array([
            [therapist.profile.gender, therapist.profile.prefered_language]
            for therapist in therapists
        ])

        # Fit OneHotEncoder on gender and preferred_language data
        encoder.fit(gender_language_data)

        # Transform gender and preferred_language data into one-hot encoded format
        encoded_data = encoder.transform(gender_language_data)

        # Combine age data with one-hot encoded gender and preferred_language data
        therapist_data = np.array([
            np.concatenate([
                [therapist.profile.age],
                encoded_data[i]
            ])
            for i, therapist in enumerate(therapists)
        ])

        # Perform similar encoding for patient data
        patient_gender_language_data = np.array([
            [patient.profile.gender, patient.profile.prefered_language]
        ])
        patient_encoded_data = encoder.transform(patient_gender_language_data)
        patient_data = np.array([
            np.concatenate([
                [patient.profile.age],
                patient_encoded_data[0]
            ])
        ])


        #similarity matrix using cosine simililarity
        similarity_matrix = np.dot(patient_data, therapist_data.T) / (np.linalg.norm(patient_data) * np.linalg.norm(therapist_data, axis=1))

        top_indices = np.argsort(similarity_matrix[0])[-3:]

        top_indices = top_indices.tolist()
        #Get top 3 therapists
        top_therapists = [therapists[idx] for idx in top_indices]

          
        top_therapists_ids = [therapist.id for therapist in top_therapists]
        

        # Filter queryset using therapist IDs
        queryset = Therapist.objects.filter(id__in=top_therapists_ids)

        
        print("Filtered queryset:", queryset)
        print('recommending for user id', user_id)
        return queryset
         