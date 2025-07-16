from rest_framework import generics, filters
from .models import Listing
from rest_framework import status
from rest_framework.views import APIView
from .serializers import ListingSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework import generics, filters
from rest_framework.exceptions import PermissionDenied
from rest_framework.permissions import AllowAny, IsAuthenticated
from .models import Listing, BookListing, SubletListing, Roommates, RideShare, EventsAndOther
from .serializers import (
    ListingSerializer, BookListingSerializer, SubletListingSerializer, 
    RoommatesSerializer, RideShareSerializer, EventsAndOtherSerializer
)

# ✅ Get all listings & Create a new listing
class ListingListCreateView(generics.ListCreateAPIView):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'description']  
    ordering_fields = ['price', 'created_at']

    def get_permissions(self):
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]
    
    def get_queryset(self):
        queryset = Listing.objects.all()
        
        # Debug logging
        print(f"\n🔹 Filter Debug - Query Params: {self.request.query_params}")
        
        # Filter by categories
        categories = self.request.query_params.getlist('category')
        if categories:
            print(f"  - Filtering by categories: {categories}")
            queryset = queryset.filter(category__in=categories)
        
        # Filter by minimum price
        min_price = self.request.query_params.get('min_price')
        if min_price:
            try:
                min_price = float(min_price)
                print(f"  - Filtering by min price: {min_price}")
                queryset = queryset.filter(price__gte=min_price)
            except ValueError:
                print(f"  - Invalid min_price value: {min_price}")
                pass
        
        # Filter by maximum price
        max_price = self.request.query_params.get('max_price')
        if max_price:
            try:
                max_price = float(max_price)
                print(f"  - Filtering by max price: {max_price}")
                queryset = queryset.filter(price__lte=max_price)
            except ValueError:
                print(f"  - Invalid max_price value: {max_price}")
                pass
        
        print(f"  - Final queryset count: {queryset.count()}")
        return queryset
    
    def perform_create(self, serializer):
        print("\n🔹 Debug - Create Listing Request:")
        print(f"  - Files: {self.request.FILES}")
        if 'image' in self.request.FILES:
            print(f"  - Image name: {self.request.FILES['image'].name}")
            print(f"  - Image size: {self.request.FILES['image'].size}")
            print(f"  - Content type: {self.request.FILES['image'].content_type}")
        serializer.save(seller=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

# ✅ Retrieve, Update, and Delete a listing
class ListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Listing.objects.all()
    serializer_class = ListingSerializer

    def get_serializer_context(self):

        return {'request': self.request}
    
    def destroy(self, request, *args, **kwargs):
        instance = self.get_object()

        if instance.seller != request.user:
            raise PermissionDenied("Not your listing.")
        
        return super().destroy(request, *args, **kwargs)

# ✅ Book Listings
class BookListingListCreateView(generics.ListCreateAPIView):
    queryset = BookListing.objects.all()
    serializer_class = BookListingSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

class BookListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = BookListing.objects.all()
    serializer_class = BookListingSerializer

    def get_serializer_context(self):
        return {'request': self.request}


# ✅ Sublet Listings
class SubletListingListCreateView(generics.ListCreateAPIView):
    queryset = SubletListing.objects.all()
    serializer_class = SubletListingSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}

class SubletListingDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = SubletListing.objects.all()
    serializer_class = SubletListingSerializer

    def get_serializer_context(self):
        return {'request': self.request}


# ✅ Roommates Listings
class RoommatesListCreateView(generics.ListCreateAPIView):
    queryset = Roommates.objects.all()
    serializer_class = RoommatesSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)

    def get_serializer_context(self):
        return {'request': self.request}
class RoommatesDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Roommates.objects.all()
    serializer_class = RoommatesSerializer

    def get_serializer_context(self):
        return {'request': self.request}


# ✅ Rideshare Listings
class RideShareListCreateView(generics.ListCreateAPIView):
    queryset = RideShare.objects.all()
    serializer_class = RideShareSerializer

    def perform_create(self, serializer):
        serializer.save(seller=self.request.user)
    
    def get_serializer_context(self):
        return {'request': self.request}

class RideShareDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = RideShare.objects.all()
    serializer_class = RideShareSerializer

    def get_serializer_context(self):
        return {'request': self.request}

class EventsAndOtherListCreateView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, *args, **kwargs):
        print("\n🔹 Received Data:", request.data)

        serializer = EventsAndOtherSerializer(data=request.data, context={'request': request})
        if serializer.is_valid():
            print("✅ Data is valid, saving to database...\n")
            serializer.save(seller=request.user)  # ✅ Explicitly set seller
            return Response(serializer.data, status=status.HTTP_201_CREATED)
        else:
            print("❌ Validation Errors:", serializer.errors, "\n")
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)
        
    def get_serializer_context(self):
        return {'request': self.request}

class EventsAndOtherDetailView(generics.RetrieveUpdateDestroyAPIView):
    queryset = EventsAndOther.objects.all()
    serializer_class = EventsAndOtherSerializer

    def get_serializer_context(self):
        return {'request': self.request}

    
