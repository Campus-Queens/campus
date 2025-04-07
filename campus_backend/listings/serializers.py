from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Listing, BookListing, SubletListing, Roommates, RideShare, EventsAndOther

User = get_user_model()  # Dynamically get your AppUser model

class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'created_at', 'profile_picture']

class ListingSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)

    class Meta:
        model = Listing
        fields = '__all__'

    def get_seller_name(self, obj):
        if obj.seller:
            return obj.seller.username
        return None


class BookListingSerializer(ListingSerializer):
    class Meta:
        model = BookListing
        fields = '__all__'

class SubletListingSerializer(ListingSerializer):
    class Meta:
        model = SubletListing
        fields = '__all__'

class RoommatesSerializer(ListingSerializer):
    class Meta:
        model = Roommates
        fields = '__all__'

class RideShareSerializer(ListingSerializer):
    class Meta:
        model = RideShare
        fields = '__all__'

class EventsAndOtherSerializer(ListingSerializer):
    class Meta:
        model = EventsAndOther
        fields = '__all__'
