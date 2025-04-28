from rest_framework import serializers
from .models import BoardListing

class BoardListingSerializer(serializers.ModelSerializer):
    class Meta:
        model = BoardListing
        fields = '__all__'