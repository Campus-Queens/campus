import React, { useEffect, useState, useRef } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../axios";
import EditProfileModal from "../components/EditProfileModal";
import { API_URL } from '../config';

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    major: "",
    yearOfStudy: "",
    bio: "",
    instagram: "",
    tiktok: "",
    youtube: "",
    snapchat: "",
    twitter: "",
  });

  // Set active tab based on URL parameter
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const tab = searchParams.get('tab');
    if (tab === 'saved') {
      setActiveTab('saved');
    }
  }, [location]);

  useEffect(() => {
    const fetchProfile = async () => {
      const userData = localStorage.getItem("user");
      if (!userData) {
        navigate("/signin");
        return;
      }

      try {
        const user = JSON.parse(userData);
        setUser(user);
        setFormData({
          name: user.name || "",
          major: user.major || "",
          yearOfStudy: user.yearOfStudy || "",
          bio: user.bio || "",
          instagram: user.instagram || "",
          tiktok: user.tiktok || "",
          youtube: user.youtube || "",
          snapchat: user.snapchat || "",
          twitter: user.twitter || "",
        });

        const savedListingIds = JSON.parse(localStorage.getItem('savedListings') || '[]');
        
        if (savedListingIds.length > 0) {
          const response = await API.get('listings/');
          const savedListingsData = response.data.filter(listing => savedListingIds.includes(listing.id));
          setSavedListings(savedListingsData);
        }
      } catch (err) {
        console.error("Error fetching data:", err);
        if (!err.response || err.response.status === 401) {
          localStorage.removeItem("user");
          navigate("/signin");
        }
      }
    };
    fetchProfile();
  }, [navigate]);

  const handleProfileImageClick = () => {
    profileInputRef.current.click();
  };

  const handleCoverPhotoClick = () => {
    coverInputRef.current.click();
  };

  const handleImageChange = async (e, type) => {
    const file = e.target.files[0];
    if (file) {
      try {
        const imageUrl = URL.createObjectURL(file);
        if (type === 'profile') {
          setProfileImage(imageUrl);        
          setProfileImageFile(file); 
        } else {
          setCoverPhoto(imageUrl);
        }
      } catch (error) {
        console.error('Error uploading image:', error);
      }
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    navigate('/signin');
  };

  const handleSubmit = async (formData) => {
    try {
      const data = new FormData();
      
      Object.entries(formData).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          data.append(key, value);
        }
      });
  
      if (profileImageFile) {
        data.append("profile_picture", profileImageFile); 
      }
      
      const response = await API.put("appuser/edit-profile/", data, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
  
      if (response.status === 200) {
        const updatedUser = response.data.user;
        localStorage.setItem('user', JSON.stringify(updatedUser));
        setUser(updatedUser);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };
  

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Cover Photo Section */}
      <div 
        onClick={handleCoverPhotoClick}
        className="relative h-64 bg-gray-200 cursor-pointer group"
      >
        {coverPhoto ? (
          <img 
            src={coverPhoto} 
            alt="Cover" 
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-blue-100 to-blue-50" />
        )}
        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 flex items-center justify-center">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-white">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.827 6.175A2.31 2.31 0 015.186 7.23c-.38.054-.757.112-1.134.175C2.999 7.58 2.25 8.507 2.25 9.574V18a2.25 2.25 0 002.25 2.25h15A2.25 2.25 0 0021.75 18V9.574c0-1.067-.75-1.994-1.802-2.169a47.865 47.865 0 00-1.134-.175 2.31 2.31 0 01-1.64-1.055l-.822-1.316a2.192 2.192 0 00-1.736-1.039 48.774 48.774 0 00-5.232 0 2.192 2.192 0 00-1.736 1.039l-.821 1.316z" />
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 12.75a4.5 4.5 0 11-9 0 4.5 4.5 0 019 0zM18.75 10.5h.008v.008h-.008V10.5z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16">
        <div className="relative">
          {/* Profile Picture */}
          <div 
            onClick={handleProfileImageClick}
            className="absolute -top-12 left-4 h-32 w-32 rounded-full border-4 border-white bg-white shadow-md cursor-pointer overflow-hidden"
          >
            {profileImage ? (
                <img src={profileImage} alt="Profile" className="h-full w-full object-cover" />
              ) : user?.profile_picture ? (
                <img
                  src={`${API_URL.replace('/api', '')}${user.profile_picture}`}
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

          {/* Name and Buttons */}
          <div className="pt-20 pb-4 flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {formData.name || "Student Name"}
              </h1>
              <p className="text-gray-600">
                {formData.major} {formData.yearOfStudy ? `- ${formData.yearOfStudy}` : ""}
              </p>
            </div>
            <div className="flex space-x-3">
              <div
                onClick={handleLogout}
                className="px-4 py-2 bg-black text-white rounded-lg hover:bg-gray-800 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                </svg>
                <span>Logout</span>
              </div>
              <div
                onClick={() => setIsEditing(true)}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center space-x-2 cursor-pointer"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
                </svg>
                <span>Edit Profile</span>
              </div>
            </div>
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
              <div
                onClick={() => setActiveTab('saved')}
                className={`py-4 px-1 border-b-2 font-medium text-sm cursor-pointer ${
                  activeTab === 'saved'
                    ? 'border-black text-black'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Saved
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
                    {formData.bio || "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat."}
                  </p>
                </div>

                {/* Social Media Links */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 mb-4">Social Media</h2>
                  <div className="space-y-3">
                    {[
                      { name: 'Instagram', icon: 'instagram', link: formData.instagram },
                      { name: 'TikTok', icon: 'tiktok', link: formData.tiktok },
                      { name: 'YouTube', icon: 'youtube', link: formData.youtube },
                      { name: 'Snapchat', icon: 'snapchat', link: formData.snapchat },
                      { name: 'Twitter', icon: 'twitter', link: formData.twitter },
                    ].map((social) => (
                      <div key={social.name} className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="w-6 h-6 flex items-center justify-center">
                            <i className={`fab fa-${social.icon}`}></i>
                          </span>
                          <span>{social.name}</span>
                        </div>
                        <div className="text-gray-400 hover:text-gray-600 cursor-pointer">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
                          </svg>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : activeTab === 'listings' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Listings will be mapped here */}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {savedListings.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    No saved listings yet
                  </div>
                ) : (
                  savedListings.map((listing) => (
                    <div 
                      key={listing.id} 
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 cursor-pointer overflow-hidden"
                      onClick={() => navigate(`/listing/${listing.id}`)}
                    >
                      {listing.image ? (
                        <img 
                          src={listing.image} 
                          alt={listing.title} 
                          className="w-full h-48 object-cover"
                        />
                      ) : (
                        <div className="w-full h-48 bg-gray-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 text-gray-400">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                          </svg>
                        </div>
                      )}
                      <div className="p-4">
                        <h3 className="text-lg font-semibold mb-2">{listing.title}</h3>
                        <div className="flex items-center justify-between">
                          <p className="text-gray-900 font-medium">${listing.price}</p>
                          <p className="text-gray-500 text-sm">{listing.seller_name}</p>
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

      {/* EditProfileModal */}
      <EditProfileModal
        isOpen={isEditing}
        onClose={() => setIsEditing(false)}
        formData={formData}
        setFormData={setFormData}
        onSubmit={handleSubmit}
      />

      {/* Hidden file inputs */}
      <input
        type="file"
        ref={profileInputRef}
        onChange={(e) => handleImageChange(e, 'profile')}
        accept="image/*"
        className="hidden"
      />
      <input
        type="file"
        ref={coverInputRef}
        onChange={(e) => handleImageChange(e, 'cover')}
        accept="image/*"
        className="hidden"
      />
    </div>
  );
};

export default Profile;
