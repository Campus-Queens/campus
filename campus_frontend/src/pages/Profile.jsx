import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { useNavigate, useLocation } from "react-router-dom";
import API from "../axios";
import EditProfileModal from "../components/EditProfileModal";
import { API_URL } from '../config';
import { Worker, Viewer } from '@react-pdf-viewer/core';
import { zoomPlugin } from '@react-pdf-viewer/zoom';
import { searchPlugin } from '@react-pdf-viewer/search';
import '@react-pdf-viewer/core/lib/styles/index.css';
import '@react-pdf-viewer/zoom/lib/styles/index.css';
import '@react-pdf-viewer/search/lib/styles/index.css';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"

// Add custom styles to override PDF viewer buttons
const customStyles = `
  .rpv-core__viewer-zone button,
  .rpv-core__minimal-button,
  .rpv-core__text-layer-button {
    background-color: transparent !important;
    color: #000 !important;
  }
  .rpv-core__viewer-zone button:hover {
    background-color: #f3f4f6 !important;
  }
`;

// Add custom styles to override PDF viewer tooltips
const customStylesTooltip = `
  .rpv-core__tooltip-body {
    background-color: black !important;
    color: white !important;
    padding: 4px 8px !important;
    border-radius: 4px !important;
    font-size: 12px !important;
  }
  .rpv-core__tooltip-arrow {
    border-top-color: black !important;
  }
`;

const ResumeModal = ({ isOpen, onClose, resumeFile }) => {
  if (!isOpen || !resumeFile) return null;

  const [fileUrl, setFileUrl] = useState(null);

  useEffect(() => {
    if (resumeFile) {
      const url = URL.createObjectURL(resumeFile);
      setFileUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [resumeFile]);

  const zoomPluginInstance = zoomPlugin();
  const searchPluginInstance = searchPlugin();

  const { ZoomInButton, ZoomOutButton, ZoomPopover } = zoomPluginInstance;
  const { Search } = searchPluginInstance;

  const renderToolbar = (Toolbar) => (
    <TooltipProvider>
      <Toolbar>
        {(props) => {
          const { items } = props;
          return (
            <div className="rpv-toolbar">
              {items.map((item, index) => (
                <div key={index} className="rpv-toolbar__item">
                  <Tooltip>
                    <TooltipTrigger asChild>
                      {item.element}
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>{item.name}</p>
                    </TooltipContent>
                  </Tooltip>
                </div>
              ))}
            </div>
          );
        }}
      </Toolbar>
    </TooltipProvider>
  );

  if (!fileUrl) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
      <style>{customStyles}</style>
      <style>{customStylesTooltip}</style>
      <div className="w-3/4 h-[85vh] bg-white flex flex-col mx-auto mt-8 mb-16 rounded-lg relative overflow-hidden">
        <div 
          className="absolute top-4 right-4 text-gray-600 hover:text-gray-800 cursor-pointer z-[60]"
          onClick={onClose}
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <div className="flex items-center justify-between p-2 border-b">
          <div className="flex items-center space-x-2">
            <ZoomOutButton />
            <ZoomPopover>
              <div className="px-2">100%</div>
            </ZoomPopover>
            <ZoomInButton />
          </div>
          <div className="flex-1 mx-4">
            <Search>
              {(props) => (
                <div className="flex items-center">
                  <input
                    className="border rounded px-2 py-1 w-1/2"
                    placeholder="Search..."
                    type="text"
                    value={props.keyword}
                    onChange={(e) => props.setKeyword(e.target.value)}
                  />
                </div>
              )}
            </Search>
          </div>

        </div>
        <div className="w-full h-full bg-white rounded-lg">
          <Worker workerUrl="https://unpkg.com/pdfjs-dist@3.11.174/build/pdf.worker.min.js">
            <Viewer
              fileUrl={fileUrl}
              plugins={[zoomPluginInstance, searchPluginInstance]}
              renderToolbar={renderToolbar}
              onError={(error) => {
                console.error('Error loading PDF:', error);
              }}
            />
          </Worker>
        </div>
      </div>
    </div>
  );
};

const Profile = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('about');
  const [isEditing, setIsEditing] = useState(false);
  const [coverPhoto, setCoverPhoto] = useState(null);
  const [profileImage, setProfileImage] = useState(null);
  const [profileImageFile, setProfileImageFile] = useState(null);
  const [coverImageFile, setCoverImageFile] = useState(null);
  const [savedListings, setSavedListings] = useState([]);
  const [userListings, setUserListings] = useState([]);
  const [isResumeModalOpen, setIsResumeModalOpen] = useState(false);
  const profileInputRef = useRef(null);
  const coverInputRef = useRef(null);
  const [formData, setFormData] = useState({
    name: "",
    major: "",
    yearOfStudy: "",
    bio: "",
    instagram: "",
    snapchat: "",
    linkedin: "",
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
        const parsedUser = JSON.parse(userData);
        setUser(parsedUser);
  
        setFormData({
          name: parsedUser.name || "",
          major: parsedUser.major || "",
          yearOfStudy: parsedUser.yearOfStudy || "",
          bio: parsedUser.bio || "",
          instagram: parsedUser.instagram || "",
          snapchat: parsedUser.snapchat || "",
          linkedin: parsedUser.linkedin || "",
        });
  
        const savedListingIds = JSON.parse(localStorage.getItem('savedListings') || '[]');
  
        const response = await axios.get('http://localhost:8000/api/listings/');
  
        if (savedListingIds.length > 0) {
          const savedListingsData = response.data.filter(listing => savedListingIds.includes(listing.id));
          setSavedListings(savedListingsData);
        }
  
        const userListingsData = response.data.filter(listing => listing.seller?.id === parsedUser.id);
        setUserListings(userListingsData);
  
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
  
  // ✅ NEW useEffect — update images when user is set
  useEffect(() => {
    if (user) {
      setProfileImage(user.profile_picture ? `${API_URL.replace('/api', '')}${user.profile_picture}` : null);
      setCoverPhoto(user.cover_picture ? `${API_URL.replace('/api', '')}${user.cover_picture}` : null);
    }
  }, [user]);
  

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
        }
        if (type === 'cover') {
          setCoverPhoto(imageUrl);
          setCoverImageFile(file);  
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

      if (coverImageFile) {
        data.append("cover_picture", coverImageFile); 
      }

      data.append("user_id", user.id);
      
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

  const handleDeleteListing = async (listingId) => {
    if (window.confirm('Are you sure you want to delete this listing?')) {
      try {
        await API.delete(`listings/${listingId}/`);
        // Update the userListings state to remove the deleted listing
        setUserListings(prevListings => prevListings.filter(listing => listing.id !== listingId));
      } catch (error) {
        console.error('Error deleting listing:', error);
        alert('Failed to delete listing. Please try again.');
      }
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
                      { name: 'LinkedIn', icon: 'linkedin', link: formData.linkedin },
                      { name: 'Snapchat', icon: 'snapchat', link: formData.snapchat },
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
            ) : activeTab === 'listings' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {userListings.length === 0 ? (
                  <div className="col-span-full text-center py-8 text-gray-500">
                    You haven't posted any listings yet
                  </div>
                ) : (
                  userListings.map((listing) => (
                    <div 
                      key={listing.id} 
                      className="bg-white rounded-lg shadow-sm hover:shadow-md transition-all duration-200 overflow-hidden relative group"
                    >
                      <div 
                        onClick={() => navigate(`/listing/${listing.id}`)}
                        className="cursor-pointer"
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
                            <p className="text-gray-500 text-sm">{new Date(listing.created_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                      </div>
                      <div
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteListing(listing.id);
                        }}
                        className="absolute bottom-[74px] right-2 p-2 text-black rounded-full opacity-0 group-hover:opacity-100 transition-opacity  hover:bg-gray-200"
                        title="Delete listing"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                        </svg>
                      </div>
                    </div>
                  ))
                )}
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

            {/* Resume Section - Always visible */}
            <div className="mt-8 border-t border-gray-200 pt-8">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Resume</h2>
              {formData.resume ? (
                <div className="flex items-center justify-between p-4 bg-white rounded-lg border border-gray-200">
                  <div className="flex items-center space-x-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-gray-400">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                    </svg>
                    <div>
                      <p className="text-sm font-medium text-gray-900">{formData.resume.name}</p>
                      <p className="text-xs text-gray-500">Last updated: {new Date(formData.resume.lastModified).toLocaleDateString()}</p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <div
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        setIsResumeModalOpen(true);
                      }}
                      className="px-3 py-1 text-sm text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      View
                    </div>
                    <a
                      href={URL.createObjectURL(formData.resume)}
                      download={formData.resume.name}
                      className="px-3 py-1 text-sm text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                    >
                      Download
                    </a>
                  </div>
                </div>
              ) : (
                <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">No resume uploaded yet</p>
                  <p className="text-xs text-gray-500">Upload your resume in the edit profile section</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resume Modal */}
      <ResumeModal
        isOpen={isResumeModalOpen}
        onClose={() => setIsResumeModalOpen(false)}
        resumeFile={formData.resume}
      />

      {/* EditProfileModal */}
      <EditProfileModal
      isOpen={isEditing}
      onClose={() => setIsEditing(false)}
      formData={formData}
      setFormData={setFormData}
      onSubmit={handleSubmit}
      profileImage={profileImage}              
      coverPhoto={coverPhoto}                 
      user={user}                             
      handleImageChange={handleImageChange}    
    />

      
    </div>
  );
};

export default Profile;
