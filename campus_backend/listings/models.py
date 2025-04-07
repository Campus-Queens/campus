from django.db import models
from django.contrib.auth.models import User

class Listing(models.Model):
    CATEGORY_CHOICES = [
        ('BOOKS', 'Books'),
        ('SUBLETS', 'Sublets'),
        ('ROOMMATES', 'Roommates'),
        ('RIDESHARE', 'Rideshare and Travel'),
        ('EVENTS', 'Events'),
        ('OTHER', 'Other'),
    ]
    
    CONDITION_CHOICES = [
        ('Poor', 'Poor'),
        ('Fair', 'Fair'),
        ('Good', 'Good'),
    ]

    category = models.CharField(max_length=20, choices=CATEGORY_CHOICES, default='OTHER')
    title = models.CharField(max_length=255)
    description = models.TextField(blank=True, null=True)
    price = models.DecimalField(max_digits=10, decimal_places=2)
    condition = models.CharField(max_length=255, choices=CONDITION_CHOICES, blank=True, null=True)
    seller = models.ForeignKey("appuser.AppUser", on_delete=models.CASCADE, related_name="listings", null=True, blank=True)
    image = models.ImageField(upload_to='listing_images/', blank=True, null=True)   # New field for book images
    created_at = models.DateTimeField(auto_now_add=True)


    def __str__(self):
        return f"{self.title} - {self.seller.username}"


class BookListing(Listing):
    author = models.CharField(max_length=255)
    edition = models.CharField(max_length=50, blank=True, null=True)
    course_code = models.CharField(max_length=255, blank=True, null=True)
    pickup_location = models.CharField(max_length=255, blank = False, null = False)

class SubletListing(Listing):
    
    YEAR_CHOICES = [
            ('First Year', 'First Year'),
            ('Second Year', 'Second Year'),
            ('Third Year', 'Third Year'),
            ('Fourth Year', 'Fourth Year'),
            ('Fifth Year or Above', 'Fifth Year or Above'),
            ('Graduate Student', 'Graduate Student')
    ]
    house_address = models.TextField(blank=False,null=False)
    rooms = models.IntegerField(blank=False, null=False)
    length_of_stay = models.CharField(max_length=255, blank=False, null=True)
    year = models.CharField(max_length=255, choices=YEAR_CHOICES, default='First Year')

class Roommates(Listing):
       
    YEAR_CHOICES = [
            ('First Year', 'First Year'),
            ('Second Year', 'Second Year'),
            ('Third Year', 'Third Year'),
            ('Fourth Year', 'Fourth Year'),
            ('Fifth Year or Above', 'Fifth Year or Above'),
            ('Graduate Student', 'Graduate Student')
    ]
    GENDER_CHOICES = [
        ('male', 'Male'),
        ('female', 'Female'),
        ('non_binary', 'Non-binary'),
        ('other', 'Other'),
        ('prefer_not_to_say', 'Prefer not to say'),
    ]

    
    year = models.CharField(max_length=255, choices=YEAR_CHOICES, default='First Year')
    age = models.IntegerField(blank=False, null=False)
    gender = models.CharField(max_length=255, choices=GENDER_CHOICES, default='prefer_not_to_say')
    program = models.CharField(max_length=255, blank=False, null=False)
    social_media = models.CharField(max_length=255, blank=True, null=True)
    additional_information = models.TextField(blank=True, null=True)

class RideShare(Listing):
    MODE_OF_TRAVEL_CHOICES = [
            ('TRAIN', 'Train'),
            ('PLANE', 'Plane'),
            ('AUTOMOBILE', 'Automobile'),
            ('BUS', 'Bus'),
            ('OTHER', 'Other'),
        ]
    pickup_location = models.CharField(max_length=255, blank = False, null = False)
    dropoff_location = models.CharField(max_length=255, blank = False, null = False)
    mode_of_travel = models.CharField(max_length=255, choices=MODE_OF_TRAVEL_CHOICES, default='Automobile', blank=False, null=False)
    date_of_travel = models.DateTimeField(null=True, blank=True)

class EventsAndOther(Listing):
    pass
