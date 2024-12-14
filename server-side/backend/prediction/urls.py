from django.urls import path
from . import views

urlpatterns = [
    path('predict/<int:user_id>/', views.PredictDisorder.as_view(), name = 'predict-disorder'),
    path('predicted_result/<int:user_id>/', views.PredictedValueViews.as_view(), name = 'predicted-results' )
]