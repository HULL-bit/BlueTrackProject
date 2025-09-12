from django.contrib import admin
from .models import Donation, DonationGoal

@admin.register(Donation)
class DonationAdmin(admin.ModelAdmin):
    list_display = [
        'id', 'display_name', 'donation_type', 'amount', 'status', 
        'is_anonymous', 'is_public', 'created_at'
    ]
    list_filter = [
        'donation_type', 'status', 'is_anonymous', 'is_public', 
        'created_at', 'confirmed_at'
    ]
    search_fields = ['donor_name', 'donor_email', 'donor_organization', 'description']
    readonly_fields = ['created_at', 'updated_at', 'confirmed_at', 'completed_at']
    fieldsets = (
        ('Informations du donateur', {
            'fields': ('donor_name', 'donor_email', 'donor_phone', 'donor_organization')
        }),
        ('Détails de la donation', {
            'fields': ('donation_type', 'amount', 'description', 'purpose')
        }),
        ('Statut et confidentialité', {
            'fields': ('status', 'is_anonymous', 'is_public')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at', 'confirmed_at', 'completed_at', 'processed_by'),
            'classes': ('collapse',)
        }),
    )
    
    def get_queryset(self, request):
        return super().get_queryset(request).select_related('processed_by')


@admin.register(DonationGoal)
class DonationGoalAdmin(admin.ModelAdmin):
    list_display = [
        'title', 'target_amount', 'current_amount', 'progress_percentage', 
        'is_active', 'deadline', 'created_at'
    ]
    list_filter = ['is_active', 'created_at', 'deadline']
    search_fields = ['title', 'description']
    readonly_fields = ['created_at', 'updated_at', 'current_amount', 'progress_percentage', 'remaining_amount']
    
    def progress_percentage(self, obj):
        return f"{obj.progress_percentage:.1f}%"
    progress_percentage.short_description = "Progression"

