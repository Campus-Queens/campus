from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Listing, BookListing, SubletListing, Roommates, RideShare, EventsAndOther

User = get_user_model() 

class SellerSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ['id', 'name', 'username', 'created_at', 'profile_picture']

class ListingSerializer(serializers.ModelSerializer):
    seller = SellerSerializer(read_only=True)
    image = serializers.ImageField(required=False)

    class Meta:
        model = Listing
        fields = '__all__'
    
    def create(self, validated_data):
        print("\n🔹 Debug - Serializer Create:")
        print(f"  - Validated data: {validated_data}")
        if 'image' in validated_data:
            print(f"  - Image data: {validated_data['image']}")
        instance = super().create(validated_data)
        print(f"  - Created instance image path: {instance.image.path if instance.image else 'No image'}")
        return instance

    def get_image(self, obj):
        request = self.context.get('request')
        if obj.image and hasattr(obj.image, 'url'):
            full_url = request.build_absolute_uri(obj.image.url)
            print(f"\n🖼️ Image Debug - Listing {obj.id}:")
            print(f"  - Image field: {obj.image}")
            print(f"  - Image path: {obj.image.path if obj.image else 'No path'}")
            print(f"  - Image URL: {obj.image.url}")
            print(f"  - Full URL: {full_url}")
            return full_url
        print(f"🖼️ Image Debug - Listing {obj.id}: No image available")
        return None

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
