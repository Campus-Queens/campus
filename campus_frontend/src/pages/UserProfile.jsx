import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import API from "../axios";
import { API_URL } from '../config';

const UserProfile = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [userListings, setUserListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('about');

  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await API.get(`appuser/users/${id}/`);
        setUser(response.data);
        setLoading(false);
      } catch (err) {
        console.error("Error fetching user profile:", err);
        setError(err.response?.data?.detail || "Failed to load user profile");
        setLoading(false);
      }
    };

    const fetchUserListings = async () => {
      try {
        const response = await API.get('listings/');
        const userListingsData = response.data.filter(listing => listing.seller?.id === parseInt(id));
        setUserListings(userListingsData);
      } catch (err) {
        console.error("Error fetching user listings:", err);
      }
    };

    fetchUserProfile();
    fetchUserListings();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-black"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen w-full bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <div
            onClick={() => navigate(-1)}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Go Back
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo Section */}
      <div className="relative h-64 bg-gray-200">
        {user?.cover_picture ? (
          <img 
            src={user.cover_picture.startsWith('http') ? user.cover_picture : `${API_URL}${user.cover_picture}`}
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-50" />
        )}
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="relative">
          {/* Profile Picture */}
          <div className="absolute -top-12 left-4 h-32 w-32 rounded-full border-4 border-white bg-white shadow-md overflow-hidden">
            {user?.profile_picture ? (
              <img
                src={user.profile_picture.startsWith('http') ? user.profile_picture : `${API_URL}${user.profile_picture}`}
                alt="Profile"
                className="h-full w-full object-cover"
              />
            ) : (
              <div className="h-full w-full bg-gray-100 flex items-center justify-center">
                <span className="text-3xl text-gray-400">
                  {user?.name?.[0]?.toUpperCase() || "?"}
                </span>
              </div>
            )}
          </div>

          {/* Name and Info */}
          <div className="pt-20 pb-4">
            <h1 className="text-2xl font-bold text-gray-900">
              {user?.name || "User"}
            </h1>
            <p className="text-gray-600">
              {user?.major} {user?.yearOfStudy ? `- ${user?.yearOfStudy}` : ""}
            </p>
          </div>

          {/* Tabs */}
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <div
                onClick={() => setActiveTab('about')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'about'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                About
              </div>
              <div
                onClick={() => setActiveTab('listings')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'listings'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Listings
              </div>
            </nav>
          </div>

          {/* Tab Content */}
          <div className="py-6">
            {activeTab === 'about' ? (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* About Section */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-600 whitespace-pre-wrap">
                    {user?.bio || "No bio available."}
                  </p>
                </div>

                {/* Social Media Links */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
                  <div className="space-y-3">
                    {[
                      { name: 'Instagram', icon: 'instagram', link: user?.instagram },
                      { name: 'LinkedIn', icon: 'linkedin', link: user?.linkedin },
                      { name: 'Snapchat', icon: 'snapchat', link: user?.snapchat },
                      { name: 'Twitter', icon: 'twitter', link: user?.twitter },
                    ].map((social) => (
                      <div key={social.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 flex items-center justify-center">
                            <i className={`fab fa-${social.icon}`}></i>
                          </span>
                          <span>{social.name}</span>
                        </div>
                        {social.link ? (
                          <a
                            href={social.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-gray-400 hover:text-gray-600 cursor-pointer"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                            </svg>
                          </a>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userListings.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No listings available
                  </div>
                ) : (
                  userListings.map((listing) => (
                    <div 
                      key={listing.id} 
                      onClick={() => navigate(`/listing/${listing.id}`)}
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                    >
                      <img 
                          src={listing.image ? `http://localhost:8000/media/${listing.image.split('/media/')[1]}` : "/placeholder.png"} 
                          alt={listing.title} 
                          className="w-full h-48 object-cover"
                        />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900 font-medium">${listing.price}</p>
                          <p className="text-gray-500 text-sm">
                            {new Date(listing.created_at).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile; 