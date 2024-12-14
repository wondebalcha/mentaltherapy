from django.contrib import admin
from payment.models import ChapaTransaction


class ChapaTransactionAdmin(admin.ModelAdmin):
    list_display =  'patient', 'therapist', 'amount', 'currency', 'status'


admin.site.register(ChapaTransaction, ChapaTransactionAdmin)
