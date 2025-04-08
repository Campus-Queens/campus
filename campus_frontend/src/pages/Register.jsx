import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from '../axios';
import ShowHideButton from "../components/ShowHideButton";


const Register = () => {
  const navigate = useNavigate();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateEmail = (email) => {
    if (!email.endsWith("@queensu.ca")) {
      setEmailError("Only @queensu.ca email addresses are allowed");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    if (!validateEmail(email)) {
      return;
    }

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      const response = await API.post('appuser/create-user/', {
        username: `${firstName} ${lastName}`,
        email,
        password,
        first_name: firstName,
        last_name: lastName,
        year: 2
      });
      // Dispatch auth change event
      window.dispatchEvent(new Event('authChange'));
      navigate("/signin"); // Redirect to sign-in after successful registration
    } catch (err) {
      console.error('Registration error:', err);
      setError(err.response?.data?.detail || err.response?.data?.error || "Registration failed. Please try again.");
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center items-center h-screen w-screen bg-white text-black">
      <div className="bg-white p-8 rounded-lg w-full max-w-lg">
        <h2 className="text-2xl font-semibold mb-1 text-center">Join Campus</h2>
        <p className="text-gray-600 text-center mb-6">Make some money off those old textbooks</p>

        <form onSubmit={handleRegister} className="space-y-4">
          <div className="flex gap-4">
            <input
              type="text"
              placeholder="First Name"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <input
              type="text"
              placeholder="Last Name"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <input
              type="email"
              placeholder="Queen's Email (@queensu.ca)"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                validateEmail(e.target.value);
              }}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
          </div>

          <div className="relative">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <ShowHideButton
              showPassword={showPassword}
              onClick={() => setShowPassword(!showPassword)}
            />
          </div>

          <div className="relative">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <ShowHideButton
              showPassword={showConfirmPassword}
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            />
          </div>

          <button type="submit" className="w-full bg-blue-600 text-white py-3 rounded-lg ">
            Agree & Join
          </button>
        </form>

        <p className="text-center text-gray-600 mt-6">
          Already have an account? <a href="/signin" className="text-blue-500">Sign in</a>
        </p>

        {error && <p className="text-red-500 text-sm text-center mt-3">{error}</p>}
      </div>
    </div>
  );
};

export default Register;
