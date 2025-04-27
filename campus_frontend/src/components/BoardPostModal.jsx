import React, { useState } from "react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

const BoardPostModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    title: "",
    organization: "",
    type: "hiring", // hiring, event, volunteer, competition, hackathon
    category: "business", // business, engineering, health, arts, stem, nonprofit
    description: "",
    isPaid: false,
    yearLevel: [], // first, all, upper
    deadline: "",
    date: "", // for events
    time: "", // for events
    location: "", // for events
    tags: ""
  });

  const [isVerified, setIsVerified] = useState(false);
  const [verificationEmail, setVerificationEmail] = useState("");

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!isVerified) {
      // Handle verification email submission
      const emailBody = `
New Board Post Verification Request

Organization: ${formData.organization}
Contact Email: ${verificationEmail}

Please verify this organization's ability to post on the board.

Submitted on: ${new Date().toLocaleString()}
      `.trim();

      const mailtoLink = `mailto:campustheapp@gmail.com?subject=Board Post Verification - ${formData.organization}&body=${encodeURIComponent(emailBody)}`;
      window.location.href = mailtoLink;
      return;
    }

    // Convert tags string to array
    const tagsArray = formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
    
    onSubmit({
      ...formData,
      tags: tagsArray
    });
    
    // Reset form
    setFormData({
      title: "",
      organization: "",
      type: "hiring",
      category: "business",
      description: "",
      isPaid: false,
      yearLevel: [],
      deadline: "",
      date: "",
      time: "",
      location: "",
      tags: ""
    });
    onClose();
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSelectChange = (name, value) => {
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleYearLevelChange = (year) => {
    setFormData(prev => ({
      ...prev,
      yearLevel: prev.yearLevel.includes(year)
        ? prev.yearLevel.filter(y => y !== year)
        : [...prev.yearLevel, year]
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-semibold">Post an Opportunity</h2>
          <div
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        </div>

        {!isVerified ? (
          <div className="space-y-4">
            <p className="text-gray-600">
              To post on the board, we need to verify your organization. Please provide your organization's email address below.
            </p>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization Email
              </label>
              <input
                type="email"
                value={verificationEmail}
                onChange={(e) => setVerificationEmail(e.target.value)}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>
            <div className="flex justify-end space-x-2">
              <div
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </div>
              <div
                type="button"
                onClick={() => setIsVerified(true)}
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Submit for Verification
              </div>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Title
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Organization
              </label>
              <input
                type="text"
                name="organization"
                value={formData.organization}
                onChange={handleChange}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type
                </label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger className="w-full border !border-gray-300 !bg-white text-gray-700 hover:bg-gray-50">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="hiring" className="text-gray-700 hover:bg-gray-50">Hiring</SelectItem>
                    <SelectItem value="event" className="text-gray-700 hover:bg-gray-50">Event</SelectItem>
                    <SelectItem value="volunteer" className="text-gray-700 hover:bg-gray-50">Volunteer</SelectItem>
                    <SelectItem value="competition" className="text-gray-700 hover:bg-gray-50">Competition</SelectItem>
                    <SelectItem value="hackathon" className="text-gray-700 hover:bg-gray-50">Hackathon</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category
                </label>
                <Select
                  value={formData.category}
                  onValueChange={(value) => handleSelectChange('category', value)}
                >
                  <SelectTrigger className="w-full border !border-gray-300 !bg-white text-gray-700 hover:bg-gray-50">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent className="bg-white border border-gray-200">
                    <SelectItem value="business" className="text-gray-700 hover:bg-gray-50">Business</SelectItem>
                    <SelectItem value="engineering" className="text-gray-700 hover:bg-gray-50">Engineering</SelectItem>
                    <SelectItem value="health" className="text-gray-700 hover:bg-gray-50">Health</SelectItem>
                    <SelectItem value="arts" className="text-gray-700 hover:bg-gray-50">Arts</SelectItem>
                    <SelectItem value="stem" className="text-gray-700 hover:bg-gray-50">STEM</SelectItem>
                    <SelectItem value="nonprofit" className="text-gray-700 hover:bg-gray-50">Non-Profit</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Description
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="w-full border border-gray-300 rounded-md p-2"
                required
              />
            </div>

            {formData.type === 'hiring' && (
              <>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="isPaid"
                    checked={formData.isPaid}
                    onCheckedChange={() => setFormData(prev => ({ ...prev, isPaid: !prev.isPaid }))}
                  />
                  <label htmlFor="isPaid" className="text-sm font-medium text-gray-700 cursor-pointer">
                    This is a paid position
                  </label>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Open To
                  </label>
                  <div className="space-y-2">
                    {['first', 'all', 'upper'].map(year => (
                      <div key={year} className="flex items-center space-x-2">
                        <Checkbox
                          id={`year-${year}`}
                          checked={formData.yearLevel.includes(year)}
                          onCheckedChange={() => handleYearLevelChange(year)}
                        />
                        <label htmlFor={`year-${year}`} className="text-sm text-gray-700 cursor-pointer">
                          {year === 'first' ? 'First Years' : year === 'all' ? 'All Years' : 'Upper Years'}
                        </label>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Application Deadline
                  </label>
                  <input
                    type="date"
                    name="deadline"
                    value={formData.deadline}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </>
            )}

            {formData.type === 'event' && (
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Date
                  </label>
                  <input
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Time
                  </label>
                  <input
                    type="time"
                    name="time"
                    value={formData.time}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full border border-gray-300 rounded-md p-2"
                    required
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Tags (comma-separated)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                placeholder="e.g., Marketing, Paid, Leadership"
                className="w-full border border-gray-300 rounded-md p-2"
              />
            </div>

            <div className="flex justify-end space-x-2">
              <div
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
              >
                Cancel
              </div>
              <div
                type="submit"
                className="px-4 py-2 bg-black text-white rounded hover:bg-gray-800"
              >
                Post Opportunity
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BoardPostModal; 