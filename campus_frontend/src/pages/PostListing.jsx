import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { listingsService } from '../services/listingsService';
import API from '../axios';
import { Button } from "../components/ui/button";
import { CategorySelect } from "../components/CategorySelect";
import { ConditionSelect } from "../components/ConditionSelect";
import { YearOfStudySelect } from "../components/YearOfStudySelect";
import { GenderSelect } from "../components/GenderSelect";
import { ModeOfTravelSelect } from "../components/ModeOfTravelSelect";

const CATEGORIES = {
  BOOKS: 'Books',
  CLOTHES: 'Clothes',
  HOUSE_ITEMS: 'House Items',
  TICKETS: 'Tickets',
  SUBLETS: 'Sublets',
  ROOMMATES: 'Roommates',
  RIDESHARE: 'Rideshare and Travel',
  OTHER: 'Other'
};

const PostListing = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    author: '',
    edition: '',
    condition: 'Good',
    price: '',
    course_code: '',
    description: '',
    pickup_location: '',
    house_address: '',
    location: '',
    num_roommates: '',
    length_of_stay: '',
    year_of_study: '',
    age: '',
    gender: '',
    program: '',
    profile_link: '',
    dropoff_location: '',
    mode_of_travel: '',
    travel_date: '',
    image: null
  });
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Check if there's any saved form data from a previous attempt
  useEffect(() => {
    const savedData = sessionStorage.getItem('pendingListing');
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      setFormData(parsedData);
      sessionStorage.removeItem('pendingListing');
    }
  }, []);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData(prev => ({
        ...prev,
        image: file
      }));
      // Create preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(JSON.stringify(err.response?.data || err.message || "Unknown error", null, 2));

    try {
        const userData = localStorage.getItem('user');
        if (!userData) {
            sessionStorage.setItem('pendingListing', JSON.stringify(formData));
            navigate('/signin?returnTo=/post-listing');
            return;
        }

        let endpoint = "api/listings/";
        switch (formData.category) {
            case "BOOKS":
                endpoint = "listings/books/";
                break;
            case "SUBLETS":
                endpoint = "listings/sublets/";
                break;
            case "ROOMMATES":
                endpoint = "listings/roommates/";
                break;
            case "RIDESHARE":
                endpoint = "listings/rideshare/";
                break;
            case "EVENTS":
            case "OTHER":
                endpoint = "listings/events/";
                break;
            default:
                break;
        }

        // Clean up the form data
        const cleanFormData = { ...formData };
        
        // Fix price
        if (!cleanFormData.price || isNaN(cleanFormData.price)) {
            cleanFormData.price = "0";  // Default to 0 for categories without a price
        }
        
        // Map fields for specific categories
        if (cleanFormData.category === "SUBLETS") {
            cleanFormData.rooms = cleanFormData.num_roommates;
            delete cleanFormData.num_roommates;
        }

        // Remove null/undefined/empty values
        Object.keys(cleanFormData).forEach(key => {
            if (cleanFormData[key] === null || cleanFormData[key] === undefined || cleanFormData[key] === '') {
                delete cleanFormData[key];
            }
        });

        const submitData = new FormData();
        Object.entries(cleanFormData).forEach(([key, value]) => {
            if (value !== null && value !== undefined && value !== '') {
                submitData.append(key, value);
            }
        });

        console.log('Submitting data:', {
            endpoint,
            formData: Object.fromEntries(submitData.entries())
        });

        const response = await API.post(endpoint, submitData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });

        navigate("/");
    } catch (err) {
        console.error("❌ Error creating listing:", err);
        setError(err.response?.data?.detail || err.message || "Failed to create listing");
    } finally {
        setLoading(false);
    }
};

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Back Button */}
      <div className="px-4 py-4">
        <div
          onClick={() => navigate("/")}
          className="border border-gray-300 p-2 rounded-md hover:bg-gray-100 transition h-10 w-10 flex items-center justify-center cursor-pointer"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="size-6">
            <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18" />
          </svg>
        </div>
      </div>

      <div className="max-w-2xl mx-auto px-8 pb-8">
        <div className="bg-white p-8 rounded-lg shadow">
          <h1 className="text-2xl font-bold mb-6">Create a New Listing</h1>

          {error && (
            <div className="bg-red-50 text-red-600 p-4 rounded-md mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Category Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category *
              </label>
              <CategorySelect 
                value={formData.category}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              />
            </div>

            {/* Only show form fields if a category is selected */}
            {formData.category && (
              <>
                {formData.category === 'BOOKS' ? (
                  <>
                    {/* Book-specific fields */}
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter the book title"
                        required
                      />
                    </div>

                    {/* Author */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Author *
                      </label>
                      <input
                        type="text"
                        name="author"
                        value={formData.author}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter the author's name"
                        required
                      />
                    </div>

                    {/* Edition */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Edition
                      </label>
                      <input
                        type="text"
                        name="edition"
                        value={formData.edition}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 3rd Edition"
                      />
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition *
                      </label>
                      <ConditionSelect
                        value={formData.condition}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    {/* Course Code */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Course Code *
                      </label>
                      <input
                        type="text"
                        name="course_code"
                        value={formData.course_code}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., CS101"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Describe the condition, any highlights, or additional details about the book..."
                        required
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full"
                        required
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>

                    {/* Pickup Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Location *
                      </label>
                      <input
                        type="text"
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., Library, Student Center, etc."
                        required
                      />
                    </div>
                  </>
                ) : formData.category === 'SUBLETS' ? (
                  <>
                    {/* Sublets-specific fields */}
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., Single Room Available in 4 Bedroom House"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description (Gender you are looking for) *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Specify preferred gender and any other important details about the living arrangement..."
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($ per month) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    {/* House Address */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        House Address *
                      </label>
                      <input
                        type="text"
                        name="house_address"
                        value={formData.house_address}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Full address of the property"
                        required
                      />
                    </div>

                    {/* Number of Roommates */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Number of Roommates *
                      </label>
                      <input
                        type="number"
                        name="num_roommates"
                        value={formData.num_roommates}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Total number of roommates in the house"
                        min="0"
                        required
                      />
                    </div>

                    {/* Length of Stay */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Length of Stay *
                      </label>
                      <input
                        type="text"
                        name="length_of_stay"
                        value={formData.length_of_stay}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., 4 months (May-August)"
                        required
                      />
                    </div>

                    {/* Year of Study */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year of Study *
                      </label>
                      <YearOfStudySelect
                        value={formData.year_of_study}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, year_of_study: value }))}
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full"
                        required
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>
                  </>
                ) : formData.category === 'ROOMMATES' ? (
                  <>
                    {/* Roommates-specific fields */}
                    {/* Title (Name) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Name *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Your full name"
                        required
                      />
                    </div>

                    {/* Description (Interests) */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Interests & About Me *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Share your interests, hobbies, lifestyle preferences, and what you're looking for in a roommate..."
                        required
                      />
                    </div>

                    {/* Year of Study */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Year of Study *
                      </label>
                      <YearOfStudySelect
                        value={formData.year_of_study}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, year_of_study: value }))}
                      />
                    </div>

                    {/* Age */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Age *
                      </label>
                      <input
                        type="number"
                        name="age"
                        value={formData.age}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Your age"
                        min="16"
                        max="100"
                        required
                      />
                    </div>

                    {/* Gender */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Gender *
                      </label>
                      <GenderSelect
                        value={formData.gender}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, gender: value }))}
                      />
                    </div>

                    {/* Program */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Program *
                      </label>
                      <input
                        type="text"
                        name="program"
                        value={formData.program}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., Computer Science, Engineering, Business..."
                        required
                      />
                    </div>

                    {/* Profile Link */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Social Media Profile
                      </label>
                      <input
                        type="url"
                        name="profile_link"
                        value={formData.profile_link}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Link to your Instagram, Facebook, or LinkedIn profile"
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Profile Picture *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full"
                        required
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>

                    {/* Additional Information */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Additional Information
                      </label>
                      <textarea
                        name="additional_info"
                        value={formData.additional_info}
                        onChange={handleInputChange}
                        rows="3"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Any other details you'd like to share (e.g., sleep schedule, cleanliness preferences, etc.)"
                      />
                    </div>
                  </>
                ) : formData.category === 'RIDESHARE' ? (
                  <>
                    {/* Rideshare-specific fields */}
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., Ride to Toronto for Reading Week"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Additional details about the ride (luggage space, stops along the way, etc.)"
                        required
                      />
                    </div>

                    {/* Pickup Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Location *
                      </label>
                      <input
                        type="text"
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Where you'll be departing from"
                        required
                      />
                    </div>

                    {/* Dropoff Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Dropoff Location *
                      </label>
                      <input
                        type="text"
                        name="dropoff_location"
                        value={formData.dropoff_location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Where you'll be arriving"
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    {/* Mode of Travel */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Mode of Travel *
                      </label>
                      <ModeOfTravelSelect
                        value={formData.mode_of_travel}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, mode_of_travel: value }))}
                      />
                    </div>

                    {/* Date of Travel */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Travel *
                      </label>
                      <input
                        type="datetime-local"
                        name="travel_date"
                        value={formData.travel_date}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        required
                      />
                    </div>
                  </>
                ) : (
                  <>
                    {/* Other category fields */}
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Title *
                      </label>
                      <input
                        type="text"
                        name="title"
                        value={formData.title}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Enter a title for your listing"
                        required
                      />
                    </div>

                    {/* Description */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description *
                      </label>
                      <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleInputChange}
                        rows="4"
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="Describe what you're listing..."
                        required
                      />
                    </div>

                    {/* Price */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Price ($) *
                      </label>
                      <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="0.00"
                        step="0.01"
                        min="0"
                        required
                      />
                    </div>

                    {/* Condition */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Condition *
                      </label>
                      <ConditionSelect
                        value={formData.condition}
                        onValueChange={(value) => setFormData(prev => ({ ...prev, condition: value }))}
                      />
                    </div>

                    {/* Image Upload */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Images *
                      </label>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={handleImageChange}
                        className="w-full"
                        required
                      />
                      {imagePreview && (
                        <div className="mt-2">
                          <img
                            src={imagePreview}
                            alt="Preview"
                            className="h-32 w-32 object-cover rounded-md"
                          />
                        </div>
                      )}
                    </div>

                    {/* Pickup Location */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Pickup Location *
                      </label>
                      <input
                        type="text"
                        name="pickup_location"
                        value={formData.pickup_location}
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border rounded-md"
                        placeholder="e.g., Library, Student Center, etc."
                        required
                      />
                    </div>
                  </>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 transition disabled:opacity-50"
                >
                  {loading ? 'Creating...' : 'Create Listing'}
                </Button>
              </>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default PostListing;
