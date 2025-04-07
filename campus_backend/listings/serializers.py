from rest_framework import serializers
from .models import *
from appuser.models import AppUser

class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = AppUser
        fields = ['id', 'name', 'username', 'created_at', 'profile_picture']


class ListingSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)


    class Meta:
        model = Listing
        fields = '__all__'  # Exports all fields

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
