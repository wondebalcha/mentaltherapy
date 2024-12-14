# backend/urls.py
from django.contrib import admin
from django.urls import path
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('core/', include("core.urls")),
    path('session/', include("communication.urls")),
    path('payment/', include("payment.urls")),
    path('community/', include("community.urls")),
    path('recommendation/', include("recommendation.urls")),
    path('prediction/', include("prediction.urls")),
]


urlpatterns +=static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

