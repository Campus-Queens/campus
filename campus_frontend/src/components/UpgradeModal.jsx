import React, { useState } from "react";

const UpgradeModal = ({ isOpen, onClose, onSubmit }) => {
  const [message, setMessage] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [agreed, setAgreed] = useState(false);
  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!agreed) return;

    // Create email body with form data
    const emailBody = `
New Board Post Request

Company/Club Name: ${company}
Contact Email: ${email}

Message:
${message}

Submitted on: ${new Date().toLocaleString()}
    `.trim();

    // Create mailto link
    const mailtoLink = `mailto:campustheapp@gmail.com?subject=New Board Post Request - ${company}&body=${encodeURIComponent(emailBody)}`;
    
    // Open default email client
    window.location.href = mailtoLink;

    // Reset form and close modal
    setMessage("");
    setCompany("");
    setEmail("");
    setAgreed(false);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-md w-full p-6">
        <h2 className="text-xl font-semibold mb-4">Upgrade Account</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company/Club Name
            </label>
            <input
              className="w-full border border-gray-300 rounded-md p-2"
              type="text"
              value={company}
              onChange={e => setCompany(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              className="w-full border border-gray-300 rounded-md p-2"
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Why do you want to post on the board?
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-md p-2"
              rows={3}
              value={message}
              onChange={e => setMessage(e.target.value)}
              required
            />
          </div>
          <div className="flex items-center">
            <input
              id="terms"
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="mr-2"
              required
            />
            <label htmlFor="terms" className="text-sm text-gray-700">
              I agree to the <a href="#" className="underline text-blue-600" target="_blank" rel="noopener noreferrer">terms and conditions</a> for posting on the board.
            </label>
          </div>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300"
            >
              Cancel
            </button>
            <button
              type="submit"
              className={`px-4 py-2 bg-black text-white rounded hover:bg-gray-800 ${!agreed ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={!agreed}
            >
              Submit
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default UpgradeModal; 