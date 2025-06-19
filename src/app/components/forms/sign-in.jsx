"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

import { useAuth } from "context/auth-context";
import { useTheme } from "context/theme-context";

import Loader from "components/loader";

export default function SignInForm() {
  // Get dark mode status from context
  const { isDarkMode } = useTheme();
  // Router for navigation after successful login
  const router = useRouter();
  // User context to update the user data after login
  const { updateUser } = useAuth();
  const [error, setError] = useState(""); // State to handle error messages
  const [loading, setLoading] = useState(false); // State to manage the loading state of the form
  const [formData, setFormData] = useState({
    username: "",
    password: ""
  }); // Form data state to handle username and password inputs

  // Handle changes in the form inputs (username and password)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submission behavior
    setError(""); // Clear previous error messages

    const formState = new FormData(e.target); // Collect form data
    const turnstileRes = formState.get("cf-turnstile-response"); // Get Turnstile verification response

    // Validate Turnstile verification (anti-bot mechanism)
    if (!turnstileRes || turnstileRes === "error") {
      setError("Turnstile verification failed.");
      return;
    };

    try {
      setLoading(true); // Set loading state to true while processing the request

      // Re-check Turnstile verification before proceeding with authentication
      if (!turnstileRes || turnstileRes === "error") {
        setError("Turnstile verification failed.");
        setLoading(false); // Reset loading state in case of failure
        return;
      };

      // Send the Turnstile response along with username and password for validation
      const response = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CHALLENGE_AUTH}`
        },
        body: JSON.stringify({
          token: turnstileRes, // Turnstile token
          ...formData // Include username and password
        })
      });

      console.log("Challenge response:", response); // Log the challenge response

      // If the challenge is successful, proceed to user authentication
      if (response.ok) {
        setLoading(true); // Keep loading state true while requesting user data

        // Encode credentials in base64 format for secure transmission
        const credentials = Buffer.from(`${formData.username}:${formData.password}`).toString("base64");
        
        // Fetch user data using the encoded credentials
        const res = await fetch("/api/auth/user", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CLIENT_AUTH}`,
            "Credentials": credentials // Include the encoded credentials in the request
          }
        });

        console.log("User response:", res); // Log the user data response

        // If the response is not OK, set an error and reset loading state
        if (!res.ok) {
          const errorData = await res.text();
          setError(`Error: ${errorData}`);
          setLoading(false);
          return;
        };

        // If successful, update the user data in the context and redirect to the user account page
        const data = await res.json();
        updateUser(data);
        router.push("/auth/my-account"); // Navigate to the user"s account page
        setLoading(false); // Reset loading state after successful login
      };
    } catch (error) {
      // Handle unexpected errors and display an error message
      setError("An unexpected error occurred.");
      console.error("Login error:", error);
      setLoading(false);
    };
  };

  // Turnstile site key for Cloudflare"s bot protection
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY;

  return (
    <>
      {/* Load the Turnstile script from Cloudflare for bot verification */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" />
      <form className="md:w-97" onSubmit={handleSubmit}>
        <h2 className="mb-12">Sign in</h2>
        {/* Username input field */}
        <input name="username" placeholder="Username" type="text" value={formData.username} onChange={handleChange} required />
        {/* Password input field */}
        <input name="password" placeholder="Password" type="password" value={formData.password} onChange={handleChange} required />
        {/* Turnstile widget for bot verification */}
        <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-callback="javascriptCallback" data-theme={isDarkMode ? "dark" : "light"} />
        {/* Display error message if any */}
        {error && <p className="u18">{error}</p>}
        {/* Submit button, shows loading indicator while processing */}
        <button type="submit" disabled={loading}>
          {loading ? <Loader /> : "Submit"}
        </button>
      </form>
    </>
  );
};