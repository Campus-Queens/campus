import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  SafeAreaView, 
  ScrollView, 
  TouchableOpacity, 
  Image, 
  ActivityIndicator,
  RefreshControl,
  StyleSheet,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { listingsService } from '../services/listings';
import { Listing } from '../types';
import ListingDetailDrawer from '../components/ListingDetailDrawer';
import MarketplaceFilters from '../components/MarketplaceFilters';

const { width } = Dimensions.get('window');

const MarketplaceScreen: React.FC = () => {
  const navigation = useNavigation();
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const [isDrawerVisible, setIsDrawerVisible] = useState(false);
  const [isFiltersVisible, setIsFiltersVisible] = useState(false);
  const [currentFilters, setCurrentFilters] = useState({
    categories: [],
    minPrice: '',
    maxPrice: '',
  });

  const fetchListings = async (filters = currentFilters) => {
    try {
      console.log('Fetching listings with filters:', filters);
      
      // Check if we have any filters applied
      const hasFilters = filters.categories.length > 0 || filters.minPrice || filters.maxPrice;
      
      let response;
      if (hasFilters) {
        response = await listingsService.getFilteredListings(filters);
      } else {
        response = await listingsService.getListings();
      }
      
      console.log('Listings response:', response);
      
      // Handle different possible response structures
      let listingsArray: Listing[] = [];
      
      if (response && typeof response === 'object') {
        // Check if it's a paginated response with 'results'
        if (Array.isArray(response.results)) {
          console.log('Found paginated response with results array');
          listingsArray = response.results;
        }
        // Check if it's a direct array
        else if (Array.isArray(response)) {
          console.log('Found direct array response');
          listingsArray = response;
        }
        else {
          console.log('Unexpected response structure:', response);
          listingsArray = [];
        }
      } else {
        console.log('Response is not an object:', response);
        listingsArray = [];
      }
      
      console.log('Processed listings array:', listingsArray);
      
      // Sort by creation date (newest first) if we have listings
      if (Array.isArray(listingsArray) && listingsArray.length > 0) {
        const sortedListings = listingsArray.sort(
          (a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setListings(sortedListings);
      } else {
        setListings([]);
      }
      
      setError(null);
    } catch (err: any) {
      console.error('Error fetching listings:', err);
      setError(err.message || 'Failed to fetch listings');
      setListings([]); // Set empty array on error
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchListings(currentFilters);
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchListings(currentFilters);
  };

  const handleListingPress = (listing: Listing) => {
    setSelectedListing(listing);
    setIsDrawerVisible(true);
  };

  const handleDrawerClose = () => {
    setIsDrawerVisible(false);
    setSelectedListing(null);
  };

  const handleListingChange = (newListing: Listing) => {
    setSelectedListing(newListing);
  };

  const handleFilters = () => {
    setIsFiltersVisible(true);
  };

  const handleApplyFilters = (filters: any) => {
    setCurrentFilters(filters);
    setLoading(true);
    fetchListings(filters);
  };

  const handleCloseFilters = () => {
    setIsFiltersVisible(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#2563eb" />
          <Text style={styles.loadingText}>Loading listings...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="alert-circle" size={48} color="#ef4444" />
          <Text style={styles.errorText}>Error: {error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={() => fetchListings(currentFilters)}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Marketplace</Text>
        <TouchableOpacity 
          style={[
            styles.postButton, 
            (currentFilters.categories.length > 0 || currentFilters.minPrice || currentFilters.maxPrice) && styles.filterButtonActive
          ]} 
          onPress={handleFilters}
        >
          <Ionicons name="filter" size={24} color="#ffffff" />
          {(currentFilters.categories.length > 0 || currentFilters.minPrice || currentFilters.maxPrice) && (
            <View style={styles.filterBadge}>
              <Text style={styles.filterBadgeText}>
                {currentFilters.categories.length + (currentFilters.minPrice ? 1 : 0) + (currentFilters.maxPrice ? 1 : 0)}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollView}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View style={styles.content}>
          {!Array.isArray(listings) || listings.length === 0 ? (
            <View style={styles.emptyContainer}>
              <Ionicons name="storefront-outline" size={64} color="#9ca3af" />
              <Text style={styles.emptyText}>No listings found</Text>
              <Text style={styles.emptySubtext}>Check back later for new listings</Text>
            </View>
          ) : (
            <View style={styles.grid}>
              {/* Listings Grid */}
              {Array.isArray(listings) && listings.map((listing) => (
                <ListingCard 
                  key={listing.id} 
                  listing={listing} 
                  onPress={() => handleListingPress(listing)}
                />
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {selectedListing && (
        <ListingDetailDrawer
          listing={selectedListing}
          isVisible={isDrawerVisible}
          onClose={handleDrawerClose}
          onListingChange={handleListingChange}
        />
      )}

      <MarketplaceFilters
        isVisible={isFiltersVisible}
        onClose={handleCloseFilters}
        onApplyFilters={handleApplyFilters}
        currentFilters={currentFilters}
      />
    </SafeAreaView>
  );
};

// Listing Card Component
const ListingCard: React.FC<{ listing: Listing; onPress: () => void }> = ({ listing, onPress }) => {
  const [isSaved, setIsSaved] = useState(false);

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'books': '#dbeafe',
      'sublets': '#e0e7ff',
      'roommates': '#f3e8ff',
      'rideshare': '#cffafe',
      'events': '#fce7f3',
    };
    return colors[category.toLowerCase()] || '#f3f4f6';
  };

  const getCategoryTextColor = (category: string) => {
    const colors: { [key: string]: string } = {
      'books': '#1e40af',
      'sublets': '#3730a3',
      'roommates': '#7c3aed',
      'rideshare': '#0e7490',
      'events': '#be185d',
    };
    return colors[category.toLowerCase()] || '#374151';
  };

  const getCategoryLabel = (category: string) => {
    const labels: { [key: string]: string } = {
      'books': 'Books',
      'sublets': 'Sublets',
      'roommates': 'Roommates',
      'rideshare': 'Rideshare',
      'events': 'Events',
    };
    return labels[category.toLowerCase()] || category;
  };

  return (
    <TouchableOpacity style={styles.listingCard} onPress={onPress}>
      {/* Save Button */}
      <TouchableOpacity 
        style={styles.saveButton}
        onPress={(e) => {
          e.stopPropagation();
          setIsSaved(!isSaved);
        }}
      >
        <Ionicons 
          name={isSaved ? "heart" : "heart-outline"} 
          size={20} 
          color={isSaved ? "#ef4444" : "#374151"} 
        />
      </TouchableOpacity>

      {/* Image */}
      <View style={styles.listingImage}>
        {listing.image ? (
          <Image 
            source={{ uri: listing.image }} 
            style={styles.image}
            resizeMode="cover"
          />
        ) : (
          <View style={styles.placeholderImage}>
            <Ionicons name="image-outline" size={48} color="#9ca3af" />
          </View>
        )}
      </View>

      {/* Content */}
      <View style={styles.listingContent}>
        {/* Price and Category */}
        <View style={styles.listingHeader}>
          <Text style={styles.listingPrice}>CA${listing.price}</Text>
          <View style={[
            styles.categoryBadge, 
            { backgroundColor: getCategoryColor(listing.category) }
          ]}>
            <Text style={[
              styles.categoryText, 
              { color: getCategoryTextColor(listing.category) }
            ]}>
              {getCategoryLabel(listing.category)}
            </Text>
          </View>
        </View>

        {/* Title */}
        <Text style={styles.listingTitle} numberOfLines={2}>
          {listing.title}
        </Text>

        {/* Description */}
        <Text style={styles.listingDescription} numberOfLines={1}>
          {listing.description}
        </Text>

        {/* Seller Info */}
        <View style={styles.sellerInfo}>
          <View style={styles.sellerAvatar}>
            {listing.seller?.profile_picture ? (
              <Image 
                source={{ uri: listing.seller.profile_picture }} 
                style={styles.avatarImage}
              />
            ) : (
              <View style={styles.avatarPlaceholder}>
                <Text style={styles.avatarText}>
                  {listing.seller?.name?.[0]?.toUpperCase() || '?'}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.sellerName} numberOfLines={1}>
            {listing.seller?.name || 'Anonymous'}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9fafb',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e5e7eb',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#111827',
  },
  postButton: {
    backgroundColor: '#2563eb',
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: '#dc2626',
  },
  filterBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: '#ffffff',
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#dc2626',
  },
  filterBadgeText: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#dc2626',
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 8,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 16,
    fontSize: 16,
    color: '#6b7280',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 32,
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: '#ef4444',
    textAlign: 'center',
  },
  retryButton: {
    marginTop: 16,
    backgroundColor: '#2563eb',
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 8,
  },
  retryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    marginTop: 16,
    fontSize: 18,
    fontWeight: '600',
    color: '#6b7280',
  },
  emptySubtext: {
    marginTop: 8,
    fontSize: 14,
    color: '#9ca3af',
  },
  grid: {
    flexDirection: 'column',
  },
  postListingCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  postListingImage: {
    aspectRatio: 16/10,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  postListingTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
    marginTop: 8,
  },
  postListingSubtitle: {
    fontSize: 12,
    color: '#9ca3af',
    marginTop: 4,
  },
  postListingContent: {
    padding: 12,
  },
  postListingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  postListingDescription: {
    fontSize: 12,
    color: '#6b7280',
  },
  listingCard: {
    width: '100%',
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  saveButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 16,
    padding: 6,
  },
  listingImage: {
    aspectRatio: 16/10,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  image: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  listingContent: {
    padding: 12,
  },
  listingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  listingPrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#111827',
  },
  categoryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  categoryText: {
    fontSize: 10,
    fontWeight: '600',
  },
  listingTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 4,
  },
  listingDescription: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 8,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  sellerAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    marginRight: 8,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#6b7280',
  },
  sellerName: {
    fontSize: 12,
    color: '#6b7280',
    flex: 1,
  },
});

export default MarketplaceScreen; 