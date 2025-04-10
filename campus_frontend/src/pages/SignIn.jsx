import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import API from "../axios";
import ShowHideButton from "../components/ShowHideButton";

const SignIn = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");

  const handleVerifyEmail = async () => {
    try {
      const response = await API.post("appuser/verify-email-by-address/", {
        email: email
      });
      alert("Email verified successfully! You can now sign in.");
      setError("");
    } catch (err) {
      setError("Failed to verify email. Please try again.");
    }
  };

  const handleSignIn = async (e) => {
    e.preventDefault();

    try {
      const response = await API.post("appuser/sign-in/", {
        email,
        password,
      });

      if (response.status === 200) {
        console.log("✅ Sign-in response:", response.data);

        if (!response.data.access_token) {
          console.error("❌ No access token in response!");
          return;
        }

        localStorage.setItem("access_token", response.data.access_token);
        localStorage.setItem("refresh_token", response.data.refresh_token);
        localStorage.setItem("user", JSON.stringify(response.data.user));

        window.dispatchEvent(new Event("authChange"));

        navigate("/welcome");
      }
    } catch (err) {
      console.error("❌ Sign-in error:", err);
      setError(err.response?.data?.error || "Invalid email or password. Please try again.");
    }
  };

  //styling
  return (
    <div className="flex justify-center min-h-screen w-screen bg-white text-black">
      {/* Right side - Sign In Form */}
      <div className="w-full sm:w-1/2 flex items-center justify-center px-4 sm:px-8">
        <div className="w-full max-w-md py-4 sm:py-0">
          <h2 className="text-xl font-semibold mb-1 text-center">Welcome Back</h2>
          <p className="text-gray-600 text-center mb-4 text-sm">Sign in to your Campus account</p>
    
          <form onSubmit={handleSignIn} className="space-y-3">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
    
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full px-3 py-2.5 text-sm border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <ShowHideButton
                showPassword={showPassword}
                onClick={() => setShowPassword(!showPassword)}
              />
            </div>

            <div className="flex justify-end">
              <a href="/forgot-password" className="text-xs text-black hover:text-gray-500">
                Forgot password?
              </a>
            </div>
    
            <div 
              onClick={handleSignIn}
              className="w-full px-3 py-2.5 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer text-sm font-medium"
            >
              Sign In
            </div>

            {/* Temporary button for email verification */}
            <div 
              onClick={handleVerifyEmail}
              className="w-full px-3 py-2.5 bg-black text-white rounded-md hover:bg-neutral-800 transition-colors cursor-pointer text-sm font-medium"
            >
              Verify Email (Temporary)
            </div>
          </form>
    
          <p className="text-center text-gray-600 mt-4 text-xs">
            New to Campus? <Link to="/register" className="text-blue-500">Create an account</Link>
          </p>
    
          {error && <p className="text-red-500 text-xs text-center mt-2">{error}</p>}
        </div>
      </div>
    </div>
  );
}  

export default SignIn;
