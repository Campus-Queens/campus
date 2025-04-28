from rest_framework import generics
from rest_framework.permissions import AllowAny
from .models import BoardListing
from .serializers import BoardListingSerializer

class BoardListingCreateView(generics.ListCreateAPIView):
    queryset = BoardListing.objects.all()
    serializer_class = BoardListingSerializer
    permission_classes = [AllowAny]

    def create(self, request, *args, **kwargs):
        print("🚨 Incoming data:", request.data)   # ADD THIS
        return super().create(request, *args, **kwargs)
    
class BoardListingListView(generics.ListAPIView):
    queryset = BoardListing.objects.all()
    serializer_class = BoardListingSerializer
    permission_classes = []