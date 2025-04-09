import React, { useState, useEffect } from 'react';
import Sidebar from "../components/Sidebar";
import BookCard from "../components/BookCard";
import { listingsService } from '../services/listingsService';
import { useNavigate } from 'react-router-dom';
import { useSearch } from '../context/SearchContext';
import { API_URL } from '../config';


const Marketplace = () => {
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [selectedCategories, setSelectedCategories] = useState([]);
  const { searchTerm } = useSearch();

  const fetchListings = async () => {
    try {
      console.log('Starting to fetch listings...');
      const data = await listingsService.getAllListings();
      console.log('Received listings:', data);
      // Sort the listings by creation date before setting them
      const sortedListings = data.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
      setListings(sortedListings);
      setLoading(false);
    } catch (err) {
      console.error('Error in Marketplace:', err);
      setError(err.message || 'Failed to fetch listings');
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const filteredListings = listings.filter(listing => {
    const matchesCategories = selectedCategories.length === 0 || selectedCategories.includes(listing.category);
    const matchesSearch = searchTerm.trim() === '' || 
      listing.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.price.toString().includes(searchTerm);
    
    return matchesCategories && matchesSearch;
  });

  const handleFiltersSubmit = (filters) => {
    console.log('Applying filters:', filters);
    setSelectedCategories(filters.categories || []);
  };

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <div className="fixed top-16 left-0 bottom-0 z-30 hidden sm:block">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} onFiltersSubmit={handleFiltersSubmit} />
        </div>
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'sm:ml-12' : 'sm:ml-64'}`}>
          <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
            <p className="text-gray-600">Loading listings...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-[calc(100vh-4rem)] w-full">
        <div className="fixed top-16 left-0 bottom-0 z-30 hidden sm:block">
          <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
        </div>
        <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'sm:ml-12' : 'sm:ml-64'}`}>
          <div className="p-6 bg-gray-50 min-h-full flex items-center justify-center">
            <p className="text-red-600">Error: {error}</p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      <div className="fixed top-16 left-0 bottom-0 z-30 hidden sm:block">
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} onFiltersSubmit={handleFiltersSubmit} />
      </div>
      <main className={`flex-1 transition-all duration-300 ${isCollapsed ? 'sm:ml-12' : 'sm:ml-64'}`}>
        <div className="p-2 sm:p-6 pb-24 sm:pb-6 bg-gray-50 min-h-full">
          {filteredListings.length === 0 ? (
            <div className="flex items-center justify-center h-full">
              <p className="text-gray-600">No listings found</p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-1 sm:gap-2 max-w-7xl mx-auto">
              {/* Post Listing Card */}
              <div 
                onClick={() => navigate('/post-listing')}
                className="hidden sm:block bg-white border-2 border-dashed border-gray-300 rounded-lg overflow-hidden shadow-sm hover:shadow-lg hover:border-blue-400 hover:border-opacity-50 transition-all duration-300 cursor-pointer transform hover:-translate-y-1"
              >
                {/* Image Section */}
                <div className="aspect-[16/10] w-full bg-gray-100 flex items-center justify-center">
                  <div className="flex flex-col items-center">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400 mb-3">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    <p className="text-lg font-medium text-gray-600">Post Listing</p>
                    <p className="text-sm text-gray-400 mt-1">Sell What You Don't Need</p>
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-3">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-lg font-bold text-transparent">Price</p>
                  </div>
                  <h3 className="text-base font-medium text-transparent mb-1">Title</h3>
                  <div className="flex items-center text-sm text-transparent mb-2">Details</div>
                  <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                    <div className="flex items-center space-x-2">
                      <div className="w-7 h-7 rounded-full bg-transparent"></div>
                      <span className="text-sm text-transparent">Seller</span>
                    </div>
                  </div>
                </div>
              </div>

              {filteredListings.map((listing) => (
                <BookCard 
                key={listing.id}
                {...listing}
                image={
                  listing.image?.startsWith('http')
                    ? listing.image
                    : `${API_URL.replace('/api', '')}/media/${listing.image?.split('/media/')[1]}`
                }
                seller_name={listing.seller?.name || "Anonymous"}
                seller_id={listing.seller?.id}
              />
              ))}
            </div>
          )}
        </div>
      </main>
    </div>
  );
};

export default Marketplace;
