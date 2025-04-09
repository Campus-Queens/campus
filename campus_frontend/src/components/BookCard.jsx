import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { API_URL } from '../config';

const BookCard = ({ id, title, course_code, price, condition, image, author, edition, category, seller_name, seller_id }) => {
  const navigate = useNavigate();
  const [isSaved, setIsSaved] = useState(false);

  // Check if listing is saved on component mount
  useEffect(() => {
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    setIsSaved(savedListings.includes(id));
  }, [id]);

  // Condition color mapping
  const conditionColors = {
    GOOD: "bg-green-100 text-green-800",
    FAIR: "bg-yellow-100 text-yellow-800",
    POOR: "bg-red-100 text-red-800",
  };

  // Category color mapping
  const categoryColors = {
    'BOOKS': "bg-blue-100 text-blue-800",
    'SUBLETS': "bg-indigo-100 text-indigo-800",
    'ROOMMATES': "bg-purple-100 text-purple-800",
    'RIDESHARE': "bg-cyan-100 text-cyan-800",
    'EVENTS': "bg-pink-100 text-pink-800",
    'OTHER': "bg-gray-100 text-gray-800",
  };

  // Category label mapping
  const categoryLabels = {
    'BOOKS': "Books",
    'SUBLETS': "Sublets",
    'ROOMMATES': "Roommates",
    'RIDESHARE': "Rideshare and Travel",
    'EVENTS': "Events",
    'OTHER': "Other",
  };

  // Handle image URL
  const placeholderImage = "/placeholder.png";
  const imageUrl = image || placeholderImage;

  const handleClick = () => {
    // Scroll to top before navigating
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'instant'
    });
    console.log('Navigating to listing:', id);
    navigate(`/listing/${id}`);
  };

  const handleMessageClick = (e) => {
    e.stopPropagation();
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/signin?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
    navigate(`/messages?seller=${seller_id}&listing=${id}`);
  };

  const handleSaveClick = (e) => {
    e.stopPropagation();
    const userData = localStorage.getItem('user');
    if (!userData) {
      navigate('/signin?returnTo=' + encodeURIComponent(window.location.pathname));
      return;
    }
    
    const savedListings = JSON.parse(localStorage.getItem('savedListings') || '[]');
    if (isSaved) {
      const newSavedListings = savedListings.filter(listingId => listingId !== id);
      localStorage.setItem('savedListings', JSON.stringify(newSavedListings));
    } else {
      savedListings.push(id);
      localStorage.setItem('savedListings', JSON.stringify(savedListings));
    }
    setIsSaved(!isSaved);
  };

  return (
    <div 
      onClick={handleClick}
      className="bg-white rounded-lg overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
    >
      {/* Save Button - Absolute positioned on image */}
      <div 
        className="absolute top-2 right-2 z-10 p-1.5 rounded-full bg-white/90 hover:bg-white shadow-sm transition-colors cursor-pointer"
        onClick={handleSaveClick}
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

      {/* Image Section */}
      <div className="aspect-[16/10] w-full">
        <img
          src={imageUrl}
          alt={title}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Content Section */}
      <div className="p-3">
        {/* Price */}
        <div className="flex items-center justify-between mb-1">
          <p className="text-lg font-bold text-gray-900">CA${price || "0.00"}</p>
          {/* Category Badge */}
          {category && (
            <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${categoryColors[category] || "bg-gray-200 text-gray-700"}`}>
              {categoryLabels[category] || category}
            </span>
          )}
        </div>

        {/* Title */}
        <h3 className="text-base font-medium text-gray-800 mb-1">{title || course_code || "Untitled"}</h3>

        {/* Location & Details */}
        <div className="flex items-center text-sm text-gray-500 mb-2">
          <span className="truncate">{author || "No details available"}</span>
          {condition && (
            <>
              <span className="mx-1.5">•</span>
              <span className="font-medium">{condition}</span>
            </>
          )}
        </div>

        {/* Bottom Bar */}
        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
          {/* Seller Profile */}
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-full bg-gray-100 flex items-center justify-center">
              <span className="text-xs font-medium text-gray-600">
                {seller_name ? seller_name[0].toUpperCase() : '?'}
              </span>
            </div>
            <span className="hidden sm:block text-sm text-gray-600 truncate max-w-[120px]">
              {seller_name || 'Anonymous'}
            </span>
          </div>

          {/* Message Button */}
          <div
            onClick={handleMessageClick}
            className="flex items-center space-x-1 px-2 py-1 rounded-full bg-gray-100 hover:bg-gray-200 transition-colors text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-4 h-4">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            <span className=" sm:block text-sm">Message</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BookCard;
