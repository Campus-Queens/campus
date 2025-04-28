from django.db import models

class BoardListing(models.Model):
    TYPE = [
        ('HIRING', 'Hiring'),
        ('EVENT', 'Event'),
        ('VOLUNTEER', 'Volunteer'),
        ('COMPETITION', 'Competition'),
        ('HACKATHON', 'HACKATHON'),
        ('OTHER', 'Other')
    ]

    CATEGORY_CHOICES = [
        ('BUSINESS', 'Business'),
        ('CLUB', 'Club'),
        ('NIGHTLIFE', 'Nightlife')
    ]

    title = models.CharField(max_length=255, blank=False, null=False)
    organization = models.CharField(max_length=255, blank=False, null=False)
    type = models.CharField(max_length=20, choices=TYPE, blank=False, null=False)
    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, blank=False, null=False)
    description = models.TextField(max_length=1000, blank=False, null=False)
    paid_position = models.BooleanField()
    date = models.DateField(blank=True, null=True)
    time = models.TimeField(blank=True, null=True)
    location = models.CharField(max_length=255, blank=True, null=True)
    open_to = models.JSONField(default=list, blank=True)
    application_deadline = models.DateField(blank=True, null=True)
    tags = models.TextField(max_length=500, blank=True, null=True)






