import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerFooter,
  DrawerClose,
} from './ui/drawer';
import ShareModal from './ShareModal';
import BookCard from './BookCard';
import { API_URL } from '../config';
import API from '../axios';

const MobileListingDrawer = ({ listing, isOpen, onClose }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [relatedListings, setRelatedListings] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);
  const [selectedListing, setSelectedListing] = useState(null);

  // Check if listing is saved on component mount
  React.useEffect(() => {
    if (listing) {
      const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
      setIsSaved(savedListings.includes(Number(listing.id)));
    }
  }, [listing]);

  // Fetch related listings
  React.useEffect(() => {
    const fetchRelatedListings = async () => {
      if (!listing?.category) {
        setRelatedLoading(false);
        return;
      }
      
      try {
        console.log('Fetching related listings for category:', listing.category);
        const response = await API.get('listings/', {
          params: {
            category: listing.category,
            limit: 4,
            exclude: listing.id
          }
        });
        console.log('Related listings response:', response.data);
        setRelatedListings(response.data.results || []);
        setRelatedLoading(false);
      } catch (err) {
        console.error('Error fetching related listings:', err);
        setRelatedLoading(false);
      }
    };

    fetchRelatedListings();
  }, [listing?.category, listing?.id]);

  if (!listing) return null;

  // Category color and label mappings
  const categoryColors = {
    'BOOKS': "bg-blue-100 text-blue-800",
    'SUBLETS': "bg-indigo-100 text-indigo-800",
    'ROOMMATES': "bg-purple-100 text-purple-800",
    'RIDESHARE': "bg-cyan-100 text-cyan-800",
    'EVENTS': "bg-pink-100 text-pink-800",
    'OTHER': "bg-gray-100 text-gray-800",
  };

  const categoryLabels = {
    'BOOKS': "Books",
    'SUBLETS': "Sublets",
    'ROOMMATES': "Roommates",
    'RIDESHARE': "Rideshare and Travel",
    'EVENTS': "Events",
    'OTHER': "Other",
  };

  const getConditionBadgeColor = (condition) => {
    if (!condition) return "bg-gray-100 text-gray-800"; 
    switch (condition.toUpperCase()) {
      case 'GOOD': return 'bg-green-100 text-green-800';
      case 'FAIR': return 'bg-yellow-100 text-yellow-800';
      case 'POOR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const handleSaveClick = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/signin?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    if (isSaved) {
      const newSavedListings = savedListings.filter(listingId => listingId !== Number(listing.id));
      localStorage.setItem('savedListings', JSON.stringify(newSavedListings));
    } else {
      savedListings.push(Number(listing.id));
      localStorage.setItem('savedListings', JSON.stringify(savedListings));
    }
    setIsSaved(!isSaved);
  };

  const handleMessageClick = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/signin?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
    navigate(`/messages?seller=${listing.seller?.id}&listing=${listing.id}`);
    onClose();
  };

  const handleViewFullDetails = () => {
    navigate(`/listing/${listing.id}`);
    onClose();
  };

  return (
    <Drawer open={isOpen} onOpenChange={onClose}>
      <DrawerContent className="max-h-[90vh]">
        {/* Fixed close button matching listing detail page style */}
        <div
          onClick={onClose}
          className="fixed left-4 top-24 z-50 bg-white rounded-full shadow-md p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
          title="Close"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          {/* Image */}
          <div className="relative h-80 w-3/4 mx-auto mb-4 rounded-lg overflow-hidden">
            {listing.image ? (
              <img
                src={listing.image}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                </svg>
              </div>
            )}
          </div>

          {/* Category and Condition Badges */}
          <div className="flex flex-wrap gap-2 mb-4">
            {listing.category && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${categoryColors[listing.category]}`}>
                {categoryLabels[listing.category]}
              </span>
            )}
            {listing.condition && (
              <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getConditionBadgeColor(listing.condition)}`}>
                {listing.condition}
              </span>
            )}
          </div>

          {/* Title and Price */}
          <h1 className="text-xl font-bold text-gray-900 mb-2">{listing.title}</h1>
          <p className="text-2xl font-bold text-black mb-4">${listing.price}</p>

          {/* Description */}
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-2">Description</h3>
            <p className="text-sm text-gray-600 whitespace-pre-line line-clamp-3">
              {listing.description}
            </p>
          </div>

          {/* Seller Info - Inline with other content */}
          <div className="bg-gray-50 rounded-lg p-3 mb-6">
            <h3 className="text-sm font-medium text-gray-900 mb-3">About the Seller</h3>
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full bg-gray-200 flex items-center justify-center">
                  {listing.seller?.profile_picture ? (
                    <img
                      src={
                        listing.seller?.profile_picture?.startsWith('http')
                          ? listing.seller.profile_picture
                          : `${API_URL.replace('/api', '')}${listing.seller.profile_picture}`
                      }
                      alt={listing.seller?.username || 'Seller'}
                      className="h-10 w-10 rounded-full object-cover"
                    />
                  ) : (
                    <span className="text-sm font-medium text-gray-600">
                      {listing.seller?.username?.[0]?.toUpperCase() || 'S'}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex-1">
                <h4 className="text-sm font-medium text-gray-900">
                  {listing.seller?.username || listing.seller?.name || 'Anonymous'}
                </h4>
                {listing.seller_program && (
                  <p className="text-xs text-gray-600">
                    {listing.seller_program} • {listing.seller_year_of_study}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>

        <DrawerFooter className="pt-0">
          <div className="flex items-center justify-between gap-1 p-4 bg-white border-t border-gray-100">
            <div
              onClick={handleMessageClick}
              className="flex-1 px-1 py-1.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer"
              title="Message Seller"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>

            <div
              onClick={handleSaveClick}
              className="flex-1 px-1 py-1.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer"
              title={isSaved ? "Remove from saved" : "Save listing"}
            >
              {isSaved ? (
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 text-red-500">
                  <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
                </svg>
              ) : (
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5 text-gray-700">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z" />
                </svg>
              )}
            </div>

            <div
              onClick={() => setIsShareModalOpen(true)}
              className="flex-1 px-1 py-1.5 bg-gray-100 text-gray-700 rounded-sm hover:bg-gray-200 transition-colors flex items-center justify-center cursor-pointer"
              title="Share listing"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
              </svg>
            </div>
          </div>
        </DrawerFooter>
      </DrawerContent>
      
      {/* Related Listings Section - Outside drawer content, like ListingDetail */}
      <div className="mt-6 px-4 pb-4">
        <h2 className="text-lg font-bold text-gray-900 mb-4">Related Listings</h2>
        {relatedLoading ? (
          <div className="flex justify-center py-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-black"></div>
          </div>
        ) : relatedListings.length > 0 ? (
          <div className="overflow-x-auto pb-2">
            <div className="flex gap-3 min-w-min">
              {relatedListings.map((relatedListing) => (
                <div key={relatedListing.id} className="w-[200px] flex-shrink-0">
                  <BookCard 
                    {...relatedListing}
                    image={relatedListing.image}
                    seller_name={relatedListing.seller?.name || relatedListing.seller_name}
                    seller_id={relatedListing.seller?.id || relatedListing.seller}
                    onClick={() => {
                      setSelectedListing(relatedListing);
                      // Reset scroll to top
                      const drawerContent = document.querySelector('[data-slot="drawer-content"]');
                      if (drawerContent) {
                        drawerContent.scrollTop = 0;
                      }
                    }}
                  />
                </div>
              ))}
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-4">No related listings found</p>
        )}
      </div>
      
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listing={listing}
      />
    </Drawer>
  );
};

export default MobileListingDrawer; 