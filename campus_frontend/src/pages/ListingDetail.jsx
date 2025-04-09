import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import API from '../axios';
import ShareModal from '../components/ShareModal';
import BookCard from '../components/BookCard';
import { API_URL } from '../config';

const ListingDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaved, setIsSaved] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [relatedListings, setRelatedListings] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(true);

  // Check if listing is saved on component mount
  useEffect(() => {
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    setIsSaved(savedListings.includes(Number(id)));
  }, [id]);

  // Scroll to top when component mounts or id changes
  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
  }, [id]);

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

  const handleSaveClick = () => {
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/signin?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    if (isSaved) {
      const newSavedListings = savedListings.filter(listingId => listingId !== Number(id));
      localStorage.setItem('savedListings', JSON.stringify(newSavedListings));
    } else {
      savedListings.push(Number(id));
      localStorage.setItem('savedListings', JSON.stringify(savedListings));
    }
    setIsSaved(!isSaved);
  };

  useEffect(() => {
    const fetchListing = async () => {
      try {
        const response = await API.get(`listings/${id}/`);
        setListing(response.data);
        setLoading(false);
      } catch (err) {
        console.error('Error fetching listing:', err);
        setError(err.response?.data?.detail || 'Failed to load listing');
        setLoading(false);
      }
    };

    fetchListing();
  }, [id]);

  // Fetch related listings
  useEffect(() => {
    const fetchRelatedListings = async () => {
      if (!listing?.category) return;
      
      try {
        const response = await API.get(`listings/`, {
          params: {
            category: listing.category,
            limit: 4,
            exclude: id
          }
        });
        setRelatedListings(response.data.results);
      } catch (err) {
        console.error('Error fetching related listings:', err);
      }
    };

    fetchRelatedListings();
  }, [listing?.category, id]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center fixed top-0 left-0">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center fixed top-0 left-0">
        <div className="flex flex-col items-center">
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Back to Listings
          </button>
        </div>
      </div>
    );
  }

  if (!listing) return null;

  const imageUrl = listing.image ? `${API_URL.replace('/api', '')}/media/${listing.image.split('/media/')[1]}` : "/placeholder.png";

  const getConditionBadgeColor = (condition) => {
    if (!condition) return "bg-gray-100 text-gray-800"; 
    switch (condition.toUpperCase()) {
      case 'GOOD': return 'bg-green-100 text-green-800';
      case 'FAIR': return 'bg-yellow-100 text-yellow-800';
      case 'POOR': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Render category-specific details
  const renderCategoryDetails = () => {
    switch (listing.category) {
      case 'BOOKS':
        return (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {listing.author && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Author</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.author}</p>
              </div>
            )}
            {listing.edition && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Edition</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.edition}</p>
              </div>
            )}
            {listing.course_code && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Course Code</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.course_code}</p>
              </div>
            )}
            {listing.pickup_location && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Pickup Location</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.pickup_location}</p>
              </div>
            )}
          </div>
        );
      case 'SUBLETS':
        return (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {listing.house_address && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Address</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.house_address}</p>
              </div>
            )}
            {listing.rooms && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Rooms</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.rooms}</p>
              </div>
            )}
            {listing.length_of_stay && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Length of Stay</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.length_of_stay}</p>
              </div>
            )}
          </div>
        );
      case 'ROOMMATES':
        return (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {listing.location && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Location</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.location}</p>
              </div>
            )}
            {listing.year_of_study && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Year of Study</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.year_of_study}</p>
              </div>
            )}
            {listing.program && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Program</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.program}</p>
              </div>
            )}
            {listing.gender && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Gender</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.gender}</p>
              </div>
            )}
          </div>
        );
      case 'RIDESHARE':
        return (
          <div className="grid grid-cols-2 gap-3 sm:gap-4">
            {listing.mode_of_travel && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Mode of Travel</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">{listing.mode_of_travel}</p>
              </div>
            )}
            {listing.travel_date && (
              <div className="bg-gray-50 p-3 sm:p-4 rounded-lg">
                <p className="text-xs sm:text-sm text-gray-500">Travel Date</p>
                <p className="text-sm sm:text-base text-gray-900 font-medium">
                  {new Date(listing.travel_date).toLocaleDateString()}
                </p>
              </div>
            )}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Fixed back arrow button */}
      <div
        onClick={() => navigate('/')}
        className="fixed left-4 top-24 z-50 bg-white rounded-full shadow-md p-3 text-gray-600 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
        title="Back to Listings"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20 sm:pb-8">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="grid grid-cols-1 lg:grid-cols-2">
            {/* Image Section */}
            <div className="h-[500px] w-full">
              <img
                src={imageUrl}
                alt={listing.title}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Details Section */}
            <div className="h-[500px] flex flex-col">
              <div className="flex-1 overflow-y-auto p-6 lg:pr-8">
                {/* Category and Condition Badges */}
                <div className="flex flex-wrap gap-2 mb-6">
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
                <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">{listing.title}</h1>
                <p className="text-3xl sm:text-4xl font-bold text-black mb-6">${listing.price}</p>

                {/* Category-specific details */}
                <div className="mb-8">
                  {renderCategoryDetails()}
                </div>

                {/* Description */}
                <div className="mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-3">Description</h3>
                  <p className="text-gray-600 whitespace-pre-line">{listing.description}</p>
                </div>

                {/* Seller Profile */}
                <div className="bg-gray-50 rounded-lg p-4 mb-8">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">About the Seller</h3>
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0">
                      <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
                      {listing.seller?.profile_picture ? (
                        <img
                          src={`${API_URL.replace('/api', '')}${listing.seller.profile_picture}`}
                          alt={listing.seller?.username || 'Seller'}
                          className="h-12 w-12 rounded-full object-cover"
                        />
                      ) : (
                        <span className="text-lg font-medium text-gray-600">
                          {listing.seller?.username?.[0]?.toUpperCase() || 'S'}
                        </span>
                      )}
                      </div>
                    </div>
                    <div className="flex-1">
                    <h4 className="text-lg font-medium text-gray-900">
                      {listing.seller?.username || listing.seller?.name || 'Anonymous'}
                    </h4>
                      {listing.seller_program && (
                        <p className="text-sm text-gray-600 mt-1">
                          {listing.seller_program} • {listing.seller_year_of_study}
                        </p>
                      )}
                      <div className="mt-3 flex items-center space-x-4">
                        <div className="text-sm text-gray-600">
                          <span className="font-medium">{listing.seller_listing_count || 0}</span> listings
                        </div>
                        {listing.seller?.created_at && (
                            <div className="text-sm text-gray-600">
                              Member since {new Date(listing.seller.created_at).toLocaleDateString()}
                            </div>
                          )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons - Now in a separate div outside the scroll area */}
              <div className="flex items-center justify-between gap-1 p-4 bg-white border-t border-gray-100">
                <div
                  onClick={() => {
                    const userData = localStorage.getItem('user');
                    if (!userData) {
                      navigate('/signin?returnTo=' + encodeURIComponent(window.location.pathname));
                      return;
                    }
                    navigate(`/messages?seller=${listing.seller_id}&listing=${listing.id}`);
                  }}
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
            </div>
          </div>
        </div>
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        listing={listing}
      />

      {/* Related Listings Section */}
      <div className="mt-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-6 px-10">Related Listings</h2>
        {relatedLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black"></div>
          </div>
        ) : relatedListings.length > 0 ? (
          <div className="px-10">
            <div className="overflow-x-auto pb-4">
              <div className="flex gap-6 min-w-min">
                {relatedListings.map((relatedListing) => (
                  <div key={relatedListing.id} className="w-[280px] flex-shrink-0">
                    <BookCard 
                    {...relatedListing}
                    image={
                      relatedListing.image?.startsWith('http')
                        ? relatedListing.image
                        : `${API_URL.replace('/api', '')}/media/${relatedListing.image?.split('/media/')[1]}`
                    }
                    seller_name={relatedListing.seller?.name || relatedListing.seller_name}
                    seller_id={relatedListing.seller?.id || relatedListing.seller}
                  />
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <p className="text-gray-500 text-center py-8">No related listings found</p>
        )}
      </div>
    </div>
  );
};

export default ListingDetail; 