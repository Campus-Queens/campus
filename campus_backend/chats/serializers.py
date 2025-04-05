from rest_framework import serializers
from .models import Chat
from appuser.serializers import UserSerializer
from listings.serializers import ListingSerializer
import logging

logger = logging.getLogger(__name__)

class ChatSerializer(serializers.ModelSerializer):
    buyer_details = UserSerializer(source='buyer', read_only=True)
    seller_details = UserSerializer(source='seller', read_only=True)
    listing_details = ListingSerializer(source='listing', read_only=True)

    class Meta:
        model = Chat
        fields = ['id', 'listing', 'buyer', 'seller', 'buyer_details', 'seller_details', 'listing_details']
        read_only_fields = ['seller', 'buyer']  # Both seller and buyer will be set automatically

    def validate(self, data):
        logger.info(f"Validating chat data: {data}")
        if 'listing' not in data:
            raise serializers.ValidationError("Listing ID is required")
        return data 