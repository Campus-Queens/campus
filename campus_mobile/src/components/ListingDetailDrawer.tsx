import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { Listing, User } from '../types';
import { listingsService } from '../services/listings';

const { width, height } = Dimensions.get('window');

interface ListingDetailDrawerProps {
  listing: Listing | null;
  isVisible: boolean;
  onClose: () => void;
  onListingChange?: (newListing: Listing) => void;
}

const ListingDetailDrawer: React.FC<ListingDetailDrawerProps> = ({
  listing,
  isVisible,
  onClose,
  onListingChange,
}) => {
  const navigation = useNavigation();
  const scrollViewRef = useRef<ScrollView>(null);
  const [isSaved, setIsSaved] = useState(false);
  const [relatedListings, setRelatedListings] = useState<Listing[]>([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Check if listing is saved on component mount
  useEffect(() => {
    if (listing) {
      // In a real app, you'd check against saved listings from storage/API
      setIsSaved(false);
    }
  }, [listing]);

  // Fetch related listings
  useEffect(() => {
    const fetchRelatedListings = async () => {
      if (!listing?.category) {
        setRelatedLoading(false);
        return;
      }
      
      try {
        console.log('Fetching related listings for category:', listing.category);
        const response = await listingsService.getListingsByCategory(listing.category);
        
        let listingsArray: Listing[] = [];
        if (response && typeof response === 'object') {
          if (Array.isArray(response.results)) {
            listingsArray = response.results;
          } else if (Array.isArray(response)) {
            listingsArray = response;
          }
        }
        
        // Filter out the current listing
        listingsArray = listingsArray.filter(item => item.id !== listing.id);
        setRelatedListings(listingsArray.slice(0, 4));
        setRelatedLoading(false);
      } catch (err) {
        console.error('Error fetching related listings:', err);
        setRelatedLoading(false);
      }
    };

    if (isVisible && listing) {
      fetchRelatedListings();
    }
  }, [listing?.category, listing?.id, isVisible]);

  if (!listing) return null;

  // Category color and label mappings
  const categoryColors = {
    'BOOKS': '#dbeafe',
    'SUBLETS': '#e0e7ff',
    'ROOMMATES': '#f3e8ff',
    'RIDESHARE': '#cffafe',
    'EVENTS': '#fce7f3',
    'OTHER': '#f3f4f6',
  };

  const categoryTextColors = {
    'BOOKS': '#1e40af',
    'SUBLETS': '#3730a3',
    'ROOMMATES': '#7c3aed',
    'RIDESHARE': '#0e7490',
    'EVENTS': '#be185d',
    'OTHER': '#374151',
  };

  const categoryLabels = {
    'BOOKS': 'Books',
    'SUBLETS': 'Sublets',
    'ROOMMATES': 'Roommates',
    'RIDESHARE': 'Rideshare and Travel',
    'EVENTS': 'Events',
    'OTHER': 'Other',
  };

  const getConditionBadgeColor = (condition: string) => {
    if (!condition) return { bg: '#f3f4f6', text: '#374151' };
    switch (condition.toUpperCase()) {
      case 'GOOD': return { bg: '#dcfce7', text: '#166534' };
      case 'FAIR': return { bg: '#fef3c7', text: '#92400e' };
      case 'POOR': return { bg: '#fee2e2', text: '#991b1b' };
      default: return { bg: '#f3f4f6', text: '#374151' };
    }
  };

  const handleSaveClick = () => {
    // In a real app, you'd save to storage/API
    setIsSaved(!isSaved);
    Alert.alert(
      isSaved ? 'Removed from saved' : 'Added to saved',
      isSaved ? 'Listing removed from your saved items' : 'Listing added to your saved items'
    );
  };

  const handleMessageClick = () => {
    // Navigate to messages with seller info
    (navigation as any).navigate('ChatDetail', { 
      chatId: 0, // You'd get the actual chat ID
      otherUser: listing.seller 
    });
    onClose();
  };

  const handleRelatedListingPress = (relatedListing: Listing) => {
    // If we have a callback to change the listing, use it
    if (onListingChange) {
      onListingChange(relatedListing);
      // Scroll to top after a short delay to ensure the new content is loaded
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true });
      }, 100);
    } else {
      // Fallback: just close the drawer
      onClose();
    }
  };

  return (
    <Modal
      visible={isVisible}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={onClose}
    >
      <View style={styles.container}>
        {/* Header with close button */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Ionicons name="close" size={24} color="#374151" />
          </TouchableOpacity>
        </View>

        <ScrollView 
          ref={scrollViewRef}
          style={styles.scrollView} 
          showsVerticalScrollIndicator={false}
        >
          {/* Image */}
          <View style={styles.imageContainer}>
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

          <View style={styles.content}>
            {/* Category and Condition Badges */}
            <View style={styles.badgesContainer}>
              {listing.category && (
                <View style={[
                  styles.badge,
                  { backgroundColor: categoryColors[listing.category as keyof typeof categoryColors] }
                ]}>
                  <Text style={[
                    styles.badgeText,
                    { color: categoryTextColors[listing.category as keyof typeof categoryTextColors] }
                  ]}>
                    {categoryLabels[listing.category as keyof typeof categoryLabels]}
                  </Text>
                </View>
              )}
              {listing.condition && (
                <View style={[
                  styles.badge,
                  { backgroundColor: getConditionBadgeColor(listing.condition).bg }
                ]}>
                  <Text style={[
                    styles.badgeText,
                    { color: getConditionBadgeColor(listing.condition).text }
                  ]}>
                    {listing.condition}
                  </Text>
                </View>
              )}
            </View>

            {/* Title and Price */}
            <Text style={styles.title}>{listing.title}</Text>
            <Text style={styles.price}>CA${listing.price}</Text>

            {/* Description */}
            <View style={styles.descriptionContainer}>
              <Text style={styles.descriptionLabel}>Description</Text>
              <Text style={styles.description}>{listing.description}</Text>
            </View>

            {/* Seller Info */}
            <View style={styles.sellerContainer}>
              <Text style={styles.sellerLabel}>About the Seller</Text>
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
                        {listing.seller?.name?.[0]?.toUpperCase() || 'S'}
                      </Text>
                    </View>
                  )}
                </View>
                <View style={styles.sellerDetails}>
                  <Text style={styles.sellerName}>
                    {listing.seller?.name || listing.seller?.username || 'Anonymous'}
                  </Text>
                  {/* Add seller program/year if available */}
                </View>
              </View>
            </View>

            {/* Related Listings */}
            <View style={styles.relatedContainer}>
              <Text style={styles.relatedTitle}>Related Listings</Text>
              {relatedLoading ? (
                <View style={styles.loadingContainer}>
                  <Text style={styles.loadingText}>Loading...</Text>
                </View>
              ) : relatedListings.length > 0 ? (
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {relatedListings.map((relatedListing) => (
                    <TouchableOpacity
                      key={relatedListing.id}
                      style={styles.relatedCard}
                      onPress={() => handleRelatedListingPress(relatedListing)}
                    >
                      <View style={styles.relatedImage}>
                        {relatedListing.image ? (
                          <Image
                            source={{ uri: relatedListing.image }}
                            style={styles.relatedImageContent}
                            resizeMode="cover"
                          />
                        ) : (
                          <View style={styles.relatedPlaceholder}>
                            <Ionicons name="image-outline" size={24} color="#9ca3af" />
                          </View>
                        )}
                      </View>
                      <View style={styles.relatedContent}>
                        <Text style={styles.relatedPrice}>CA${relatedListing.price}</Text>
                        <Text style={styles.relatedTitle} numberOfLines={2}>
                          {relatedListing.title}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              ) : (
                <Text style={styles.noRelatedText}>No related listings found</Text>
              )}
            </View>
          </View>
        </ScrollView>

        {/* Action Buttons */}
        <View style={styles.actionBar}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleMessageClick}
          >
            <Ionicons name="chatbubble-outline" size={20} color="#374151" />
            <Text style={styles.actionButtonText}>Message</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={handleSaveClick}
          >
            <Ionicons 
              name={isSaved ? "heart" : "heart-outline"} 
              size={20} 
              color={isSaved ? "#ef4444" : "#374151"} 
            />
            <Text style={[styles.actionButtonText, { color: isSaved ? "#ef4444" : "#374151" }]}>
              {isSaved ? 'Saved' : 'Save'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 8,
  },
  closeButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollView: {
    flex: 1,
  },
  imageContainer: {
    width: width * 0.75,
    height: 320,
    alignSelf: 'center',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 16,
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
  content: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  badgesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 8,
  },
  price: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000000',
    marginBottom: 24,
  },
  descriptionContainer: {
    marginBottom: 24,
  },
  descriptionLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: '#6b7280',
    lineHeight: 20,
  },
  sellerContainer: {
    backgroundColor: '#f9fafb',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
  },
  sellerLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 12,
  },
  sellerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sellerAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 12,
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#e5e7eb',
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontWeight: '600',
    color: '#6b7280',
  },
  sellerDetails: {
    flex: 1,
  },
  sellerName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  relatedContainer: {
    marginBottom: 20,
  },
  relatedTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 16,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#6b7280',
  },
  noRelatedText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
    paddingVertical: 20,
  },
  relatedCard: {
    width: 160,
    backgroundColor: '#ffffff',
    borderRadius: 12,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  relatedImage: {
    width: '100%',
    height: 100,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    overflow: 'hidden',
  },
  relatedImageContent: {
    width: '100%',
    height: '100%',
  },
  relatedPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: '#f3f4f6',
    justifyContent: 'center',
    alignItems: 'center',
  },
  relatedContent: {
    padding: 12,
  },
  relatedPrice: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#111827',
    marginBottom: 4,
  },
  actionBar: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#f3f4f6',
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    marginHorizontal: 4,
    backgroundColor: '#f3f4f6',
    borderRadius: 8,
  },
  actionButtonText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#374151',
    marginLeft: 4,
  },
});

export default ListingDetailDrawer; 