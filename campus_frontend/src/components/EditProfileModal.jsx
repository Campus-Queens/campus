import React, { useRef } from 'react';

const EditProfileModal = ({ isOpen, onClose, formData, setFormData, onSubmit }) => {
  if (!isOpen) return null;
  const resumeInputRef = useRef(null);
  const coverLetterInputRef = useRef(null);

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
    onClose();
  };

  const handleFileChange = (e, type) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, [type]: file });
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold text-gray-900">Edit Profile</h2>
            <div
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 cursor-pointer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Basic Information</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Major</label>
                <input
                  type="text"
                  value={formData.major}
                  onChange={(e) => setFormData({ ...formData, major: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Year of Study</label>
                <input
                  type="text"
                  value={formData.yearOfStudy}
                  onChange={(e) => setFormData({ ...formData, yearOfStudy: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">About</label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={4}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                />
              </div>
            </div>

            {/* Resume and Cover Letter */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Documents</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Resume Upload */}
                <div 
                  onClick={() => resumeInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <input
                    type="file"
                    ref={resumeInputRef}
                    onChange={(e) => handleFileChange(e, 'resume')}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.resume ? formData.resume.name : 'Upload Resume'}
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                </div>

                {/* Cover Letter Upload */}
                {/* <div 
                  onClick={() => coverLetterInputRef.current.click()}
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <input
                    type="file"
                    ref={coverLetterInputRef}
                    onChange={(e) => handleFileChange(e, 'coverLetter')}
                    accept=".pdf,.doc,.docx"
                    className="hidden"
                  />
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 mx-auto text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    {formData.coverLetter ? formData.coverLetter.name : 'Upload Cover Letter'}
                  </p>
                  <p className="text-xs text-gray-500">PDF, DOC, DOCX</p>
                </div> */}
              </div>
            </div>

            {/* Social Media Links */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-gray-900">Social Media Links</h3>
              
              <div>
                <label className="block text-sm font-medium text-gray-700">Instagram</label>
                <input
                  type="text"
                  value={formData.instagram}
                  onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Your Instagram handle"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">LinkedIn</label>
                <input
                  type="text"
                  value={formData.linkedin}
                  onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Your LinkedIn profile URL"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Snapchat</label>
                <input
                  type="text"
                  value={formData.snapchat}
                  onChange={(e) => setFormData({ ...formData, snapchat: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Your Snapchat username"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700">Twitter</label>
                <input
                  type="text"
                  value={formData.twitter}
                  onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                  className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 text-gray-900 shadow-sm focus:border-black focus:ring-black sm:text-sm"
                  placeholder="Your Twitter handle"
                />
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-3 pt-6">
              <div
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black cursor-pointer"
              >
                Cancel
              </div>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-black rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black cursor-pointer"
              >
                Save Changes
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal; 