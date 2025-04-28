import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Form, FormControl, FormField, FormItem, FormLabel } from "@/components/ui/form";
import ShareModal from '@/components/ShareModal';
import BoardPostModal from '@/components/BoardPostModal';
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import API from '../axios';

const Board = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedPost, setSelectedPost] = useState(null);
  const [activeTab, setActiveTab] = useState('main'); // main, myBoard, post, opportunities, directory
  const [expandedSections, setExpandedSections] = useState({
    postType: false,
    category: false,
    dateRange: false,
    compensation: false,
    yearLevel: false,
    postedBy: false,
    location: false
  });
  const [savedBoardPosts, setSavedBoardPosts] = useState([]);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [isBoardPostModalOpen, setIsBoardPostModalOpen] = useState(false);

  const form = useForm({
    defaultValues: {
      postType: [],
      category: [],
      dateRange: 'all',
      compensation: [],
      yearLevel: [],
      postedBy: [],
      followedClubs: false,
      location: []
    },
  });

const [posts, setPosts] = useState([]);

const getBoardPosts = async () => {
  try {
    const response = await API.get('board/');  // assuming your GET endpoint is ready
    console.log("Fetched board posts:", response.data);
    setPosts(response.data);
  } catch (error) {
    console.error("Error fetching board posts:", error);
  }
};

 

  const filterOptions = {
    postType: [
      { id: 'hiring', label: 'Hiring' },
      { id: 'event', label: 'Event' },
      { id: 'volunteer', label: 'Volunteer' },
      { id: 'competition', label: 'Competition' },
      { id: 'hackathon', label: 'Hackathon' }
    ],
    category: [
      { id: 'business', label: 'Business' },
      { id: 'engineering', label: 'Engineering' },
      { id: 'health', label: 'Health' },
      { id: 'arts', label: 'Arts' },
      { id: 'stem', label: 'STEM' },
      { id: 'nonprofit', label: 'Non-Profit' }
    ],
    dateRange: [
      { id: 'week', label: 'This Week' },
      { id: 'month', label: 'This Month' },
      { id: 'all', label: 'All Time' }
    ],
    compensation: [
      { id: 'paid', label: 'Paid' },
      { id: 'volunteer', label: 'Volunteer' }
    ],
    yearLevel: [
      { id: 'first', label: 'First Years' },
      { id: 'all', label: 'All Years' },
      { id: 'upper', label: 'Upper Years' }
    ],
    postedBy: [
      { id: 'faculty', label: 'Faculty' },
      { id: 'ams', label: 'AMS Clubs' },
      { id: 'external', label: 'External Recruiters' }
    ],
    location: [
      { id: 'campus', label: 'On Campus' },
      { id: 'downtown', label: 'Downtown' },
      { id: 'university_district', label: 'University District' },
      { id: 'west_campus', label: 'West Campus' },
      { id: 'north_campus', label: 'North Campus' },
      { id: 'south_campus', label: 'South Campus' }
    ]
  };

  const handleFilterChange = (category, value) => {
    const currentValues = form.getValues(category);
    const newValues = currentValues.includes(value)
      ? currentValues.filter(item => item !== value)
      : [...currentValues, value];
    form.setValue(category, newValues);
  };

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  useEffect(() => {
    // Load saved posts from localStorage on mount
    const saved = localStorage.getItem('savedBoardPosts');
    if (saved) {
      setSavedBoardPosts(JSON.parse(saved));
    }
  }, []);

  useEffect(() => {
    getBoardPosts();
  }, []);
  

  const savePostForLater = (post) => {
    // Avoid duplicates
    if (savedBoardPosts.some(p => p.id === post.id)) return;
    const updated = [...savedBoardPosts, post];
    setSavedBoardPosts(updated);
    localStorage.setItem('savedBoardPosts', JSON.stringify(updated));
  };

  const removeSavedPost = (postId) => {
    const updated = savedBoardPosts.filter(p => p.id !== postId);
    setSavedBoardPosts(updated);
    localStorage.setItem('savedBoardPosts', JSON.stringify(updated));
  };

  const handleBoardPost = async (formData) => {
    try {
      const payload = {
        title: formData.title,
        organization: formData.organization,
        type: formData.type.toUpperCase(),
        category: formData.category.toUpperCase(),
        description: formData.description,
        paid_position: formData.isPaid,
        open_to: formData.yearLevel || [],
        application_deadline: formData.deadline || null,
        date: formData.date || null,
        time: formData.time || null,
        location: formData.location || "",
        tags: Array.isArray(formData.tags) ? formData.tags.join(", ") : (formData.tags || "")
      };

      console.log("🚀 Sending Payload:", payload);

  
      const response = await API.post('board/create/', payload);
      await getBoardPosts();
  
      console.log("Board post created successfully:", response.data);
  
    } catch (error) {
      console.error("Error creating board post:", error);
    }
  };
  

  const renderTopNav = () => (
    <div className="bg-white border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex space-x-8">
            <div 
              onClick={() => setActiveTab('main')}
              className={`cursor-pointer inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                activeTab === 'main' 
                  ? 'border-black text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Main Feed
            </div>
            <div 
              onClick={() => setActiveTab('nightlife')}
              className={`cursor-pointer inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                activeTab === 'nightlife' 
                  ? 'border-black text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Nightlife
            </div>
            <div 
              onClick={() => setActiveTab('myBoard')}
              className={`cursor-pointer inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                activeTab === 'myBoard' 
                  ? 'border-black text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              My Board
            </div>
            <div 
              onClick={() => setActiveTab('opportunities')}
              className={`cursor-pointer inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                activeTab === 'opportunities' 
                  ? 'border-black text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              For You
            </div>
            <div 
              onClick={() => setActiveTab('directory')}
              className={`cursor-pointer inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                activeTab === 'directory' 
                  ? 'border-black text-gray-900' 
                  : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
              }`}
            >
              Directory
            </div>
          </div>
          <div className="flex items-center">
            <div 
              onClick={() => setIsBoardPostModalOpen(true)}
              className="ml-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 cursor-pointer"
            >
              Post Opportunity
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderPostCard = (post) => {
    const isSaved = savedBoardPosts.some(p => p.id === post.id);
    const tags = typeof post.tags === 'string' ? post.tags.split(',').map(tag => tag.trim()) : (post.tags || []);
    return (
      <div
        key={post.id}
        onClick={() => setSelectedPost(selectedPost?.id === post.id ? null : post)}
        className="bg-white rounded-lg shadow mb-4 p-6 cursor-pointer hover:shadow-md transition-shadow mx-4 relative"
      >
        {/* Bookmark icon in top right */}
        <div
          onClick={e => {
            e.stopPropagation();
            if (isSaved) {
              removeSavedPost(post.id);
            } else {
              savePostForLater(post);
            }
          }}
          className={`absolute top-4 right-4 cursor-pointer flex items-center border border-gray-300 p-2 rounded-md hover:bg-gray-100 transition-colors justify-center ${isSaved ? 'text-black' : 'text-gray-700 hover:text-black'}`}
          title={isSaved ? 'Remove from Saved' : 'Save for Later'}
          aria-label={isSaved ? 'Remove from Saved' : 'Save for Later'}
        >
          {isSaved ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
              <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
            </svg>
          )}
        </div>
        <div className="flex items-start space-x-4">
          <div className="h-12 w-12 rounded-full bg-gray-200 flex-shrink-0">
            {/* Replace with actual logo */}
            <div className="h-full w-full rounded-full flex items-center justify-center text-gray-500 text-lg font-medium">
              {post.organization[0]}
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-semibold text-gray-900">{post.title}</h2>
                <p className="text-gray-600">{post.organization}</p>
                <div className="flex items-center mt-2 text-sm text-gray-500">
                  <span>{post.type === 'event' ? post.date : post.postedAt}</span>
                  {post.type === 'event' && (
                    <>
                      <span className="mx-2">•</span>
                      <span>{post.time}</span>
                      <span className="mx-2">•</span>
                      <span>{post.location}</span>
                    </>
                  )}
                </div>
                <div className="flex flex-wrap gap-2 mt-3">
                  {tags.map((tag, index) => (
                    <span 
                      key={index}
                      className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                    >
                      #{tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const renderMainContent = () => {
    switch (activeTab) {
      case 'main':
        return (
          <div className="w-full px-4 py-4 relative">
            {selectedPost && (
              <div
                onClick={() => setSelectedPost(null)}
                className="fixed left-4 top-20 z-10 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-shadow cursor-pointer"
                role="button"
                aria-label="Go back"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </div>
            )}
            <div className="max-w-none">
              {posts.map(post => renderPostCard(post))}
            </div>
          </div>
        );
      case 'myBoard':
        return (
          <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">My Saved Items</h2>
            {savedBoardPosts.length === 0 ? (
              <div className="text-gray-500">No saved posts yet.</div>
            ) : (
              savedBoardPosts.map(post => (
                <div key={post.id} className="bg-white rounded-lg shadow mb-4 p-6 flex justify-between items-center">
                  <div>
                    <h3 className="text-lg font-semibold">{post.title}</h3>
                    <p className="text-gray-600">{post.organization}</p>
                  </div>
                  <button
                    onClick={() => removeSavedPost(post.id)}
                    className="ml-4 px-3 py-1 text-sm text-white bg-red-500 rounded hover:bg-red-600"
                  >
                    Remove
                  </button>
                </div>
              ))
            )}
          </div>
        );
      case 'nightlife':
        return (
          <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Whats happening in town Tn?</h2>
            {/* Add nightlife listings */}
          </div>
        );
      case 'opportunities':
        return (
          <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Recommended For You</h2>
            {/* Add personalized recommendations */}
          </div>
        );
      case 'directory':
        return (
          <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Clubs & Employers</h2>
            {/* Add directory listing */}
          </div>
        );
      case 'post':
        return (
          <div className="max-w-3xl mx-auto py-4 px-4 sm:px-6 lg:px-8">
            <h2 className="text-2xl font-bold mb-6">Post an Opportunity</h2>
            {/* Add posting form */}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-[calc(100vh-64px)]">
      {renderTopNav()}
      <div className="flex h-[calc(100vh-64px-4rem)]">
        {/* Left Sidebar - Filters */}
        <div className="w-72 border-r border-gray-200 p-4 bg-white hidden md:block overflow-y-auto">
          <Form {...form}>
            <form className="space-y-6">
              {/* Search Keywords */}
              <div>
                <h3 className="text-sm font-medium text-gray-900 mb-2">Search</h3>
                <input
                  type="text"
                  placeholder="Keywords..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                />
              </div>

              {/* Post Type */}
              <div>
                <div
                  onClick={() => toggleSection('postType')}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h3 className="text-sm font-medium text-gray-900">Post Type</h3>
                  <svg
                    className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                      expandedSections.postType ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`space-y-2 mt-2 ${expandedSections.postType ? '' : 'hidden'}`}>
                  <FormField
                    control={form.control}
                    name="postType"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {filterOptions.postType.map((type) => (
                            <FormItem
                              key={type.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.watch('postType').includes(type.id)}
                                  onCheckedChange={(checked) => {
                                    handleFilterChange('postType', type.id);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {type.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Category */}
              <div>
                <div
                  onClick={() => toggleSection('category')}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h3 className="text-sm font-medium text-gray-900">Category</h3>
                  <svg
                    className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                      expandedSections.category ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`space-y-2 mt-2 ${expandedSections.category ? '' : 'hidden'}`}>
                  <FormField
                    control={form.control}
                    name="category"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {filterOptions.category.map((cat) => (
                            <FormItem
                              key={cat.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.watch('category').includes(cat.id)}
                                  onCheckedChange={(checked) => {
                                    handleFilterChange('category', cat.id);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {cat.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Date Range */}
              <div>
                <div
                  onClick={() => toggleSection('dateRange')}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h3 className="text-sm font-medium text-gray-900">Date Posted</h3>
                  <svg
                    className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                      expandedSections.dateRange ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`space-y-2 mt-2 ${expandedSections.dateRange ? '' : 'hidden'}`}>
                  <FormField
                    control={form.control}
                    name="dateRange"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {filterOptions.dateRange.map((range) => (
                            <FormItem
                              key={range.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.watch('dateRange').includes(range.id)}
                                  onCheckedChange={(checked) => {
                                    handleFilterChange('dateRange', range.id);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {range.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Compensation */}
              <div>
                <div
                  onClick={() => toggleSection('compensation')}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h3 className="text-sm font-medium text-gray-900">Compensation</h3>
                  <svg
                    className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                      expandedSections.compensation ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`space-y-2 mt-2 ${expandedSections.compensation ? '' : 'hidden'}`}>
                  <FormField
                    control={form.control}
                    name="compensation"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {filterOptions.compensation.map((comp) => (
                            <FormItem
                              key={comp.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.watch('compensation').includes(comp.id)}
                                  onCheckedChange={(checked) => {
                                    handleFilterChange('compensation', comp.id);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {comp.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Year Level */}
              <div>
                <div
                  onClick={() => toggleSection('yearLevel')}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h3 className="text-sm font-medium text-gray-900">Open To</h3>
                  <svg
                    className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                      expandedSections.yearLevel ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`space-y-2 mt-2 ${expandedSections.yearLevel ? '' : 'hidden'}`}>
                  <FormField
                    control={form.control}
                    name="yearLevel"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {filterOptions.yearLevel.map((year) => (
                            <FormItem
                              key={year.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.watch('yearLevel').includes(year.id)}
                                  onCheckedChange={(checked) => {
                                    handleFilterChange('yearLevel', year.id);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {year.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Posted By */}
              <div>
                <div
                  onClick={() => toggleSection('postedBy')}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h3 className="text-sm font-medium text-gray-900">Posted By</h3>
                  <svg
                    className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                      expandedSections.postedBy ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`space-y-2 mt-2 ${expandedSections.postedBy ? '' : 'hidden'}`}>
                  <FormField
                    control={form.control}
                    name="postedBy"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {filterOptions.postedBy.map((poster) => (
                            <FormItem
                              key={poster.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.watch('postedBy').includes(poster.id)}
                                  onCheckedChange={(checked) => {
                                    handleFilterChange('postedBy', poster.id);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {poster.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Location */}
              <div>
                <div
                  onClick={() => toggleSection('location')}
                  className="flex items-center justify-between cursor-pointer group"
                >
                  <h3 className="text-sm font-medium text-gray-900">Location</h3>
                  <svg
                    className={`h-5 w-5 text-gray-400 group-hover:text-gray-500 transition-transform ${
                      expandedSections.location ? 'transform rotate-180' : ''
                    }`}
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className={`space-y-2 mt-2 ${expandedSections.location ? '' : 'hidden'}`}>
                  <FormField
                    control={form.control}
                    name="location"
                    render={() => (
                      <FormItem>
                        <div className="space-y-2">
                          {filterOptions.location.map((loc) => (
                            <FormItem
                              key={loc.id}
                              className="flex flex-row items-start space-x-3 space-y-0"
                            >
                              <FormControl>
                                <Checkbox
                                  checked={form.watch('location').includes(loc.id)}
                                  onCheckedChange={(checked) => {
                                    handleFilterChange('location', loc.id);
                                  }}
                                />
                              </FormControl>
                              <FormLabel className="text-sm font-normal">
                                {loc.label}
                              </FormLabel>
                            </FormItem>
                          ))}
                        </div>
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Followed Clubs Toggle */}
              <FormField
                control={form.control}
                name="followedClubs"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <FormLabel className="text-sm font-normal">
                      Only Show Followed Clubs
                    </FormLabel>
                  </FormItem>
                )}
              />

              {/* Clear Filters */}
              <div
                onClick={() => form.reset()}
                className="w-full px-4 py-2 mt-4 text-sm text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 transition-colors cursor-pointer text-center"
              >
                Clear All Filters
              </div>
            </form>
          </Form>
        </div>

        {/* Main Content */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {renderMainContent()}
        </div>

        {/* Right Sidebar - Post Details */}
        <div
          className={`fixed right-0 top-16 h-[calc(100vh-64px)] w-full md:w-[32rem] bg-white border-l border-gray-200 transform transition-transform duration-300 ease-in-out ${
            selectedPost ? 'translate-x-0' : 'translate-x-full'
          }`}
        >
          {selectedPost && (
            <div className="h-full overflow-y-auto">
              <div className="p-6">
                <div
                  onClick={() => setSelectedPost(null)}
                  className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 cursor-pointer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </div>

                <div className="flex items-center space-x-4 mb-6">
                  <div className="h-16 w-16 rounded-full bg-gray-200 flex-shrink-0">
                    <div className="h-full w-full rounded-full flex items-center justify-center text-gray-500 text-xl font-medium">
                      {selectedPost.organization[0]}
                    </div>
                  </div>
                  <div>
                    <h1 className="text-2xl font-bold text-gray-900">{selectedPost.title}</h1>
                    <p className="text-lg text-gray-600">{selectedPost.organization}</p>
                  </div>
                </div>

                <div className="space-y-6">
                  {selectedPost.type === 'event' ? (
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Event Details</h2>
                      <div className="space-y-2">
                        <p><span className="font-medium">Date:</span> {selectedPost.date}</p>
                        <p><span className="font-medium">Time:</span> {selectedPost.time}</p>
                        <p><span className="font-medium">Location:</span> {selectedPost.location}</p>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <h2 className="text-xl font-semibold mb-2">Position Details</h2>
                      <div className="space-y-2">
                        <p><span className="font-medium">Type:</span> {selectedPost.isPaid ? 'Paid Position' : 'Volunteer'}</p>
                        <p><span className="font-medium">Open to:</span> {selectedPost.yearLevel.join(', ')}</p>
                        <p><span className="font-medium">Deadline:</span> {selectedPost.deadline}</p>
                      </div>
                    </div>
                  )}

                  <div>
                    <h2 className="text-xl font-semibold mb-2">Description</h2>
                    <p className="text-gray-600">{selectedPost.description}</p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {selectedPost.tags.map((tag, index) => (
                      <span 
                        key={index}
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="mt-8 space-y-4">
                  <div 
                    onClick={() => {
                      // Add apply/RSVP logic
                    }}
                    className="w-full px-6 py-3 bg-black text-white rounded-md hover:bg-gray-800 transition-colors text-lg font-medium cursor-pointer text-center"
                    role="button"
                  >
                    {selectedPost.type === 'event' ? 'RSVP Now' : 'Apply Now'}
                  </div>
                  <div className="mt-4 flex flex-row items-center gap-4">
                    {/* Save for Later icon */}
                    <div
                      onClick={() => {
                        if (selectedPost) {
                          const isSaved = savedBoardPosts.some(p => p.id === selectedPost.id);
                          if (isSaved) {
                            removeSavedPost(selectedPost.id);
                          } else {
                            savePostForLater(selectedPost);
                          }
                        }
                      }}
                      className={`cursor-pointer flex items-center justify-center ${savedBoardPosts.some(p => p.id === selectedPost?.id) ? 'text-black' : 'text-gray-700 hover:text-black'}`}
                      title={savedBoardPosts.some(p => p.id === selectedPost?.id) ? 'Remove from Saved' : 'Save for Later'}
                      aria-label={savedBoardPosts.some(p => p.id === selectedPost?.id) ? 'Remove from Saved' : 'Save for Later'}
                    >
                      {savedBoardPosts.some(p => p.id === selectedPost?.id) ? (
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6">
                          <path fillRule="evenodd" d="M6.32 2.577a49.255 49.255 0 0 1 11.36 0c1.497.174 2.57 1.46 2.57 2.93V21a.75.75 0 0 1-1.085.67L12 18.089l-7.165 3.583A.75.75 0 0 1 3.75 21V5.507c0-1.47 1.073-2.756 2.57-2.93Z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M17.593 3.322c1.1.128 1.907 1.077 1.907 2.185V21L12 17.25 4.5 21V5.507c0-1.108.806-2.057 1.907-2.185a48.507 48.507 0 0 1 11.186 0Z" />
                        </svg>
                      )}
                    </div>
                    {/* Share icon (ListingDetail style) */}
                    <div
                      className="cursor-pointer flex items-center justify-center text-gray-700 hover:text-black"
                      title="Share"
                      aria-label="Share"
                      onClick={() => setIsShareModalOpen(true)}
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.368 2.684 3 3 0 00-5.368-2.684z" />
                      </svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
      <ShareModal
        isOpen={isShareModalOpen}
        onClose={() => setIsShareModalOpen(false)}
        post={selectedPost}
      />
      <BoardPostModal
        isOpen={isBoardPostModalOpen}
        onClose={() => setIsBoardPostModalOpen(false)}
        onSubmit={handleBoardPost}
      />
    </div>
  );
};

export default Board; 