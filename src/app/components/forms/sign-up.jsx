"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { useAuth } from "context/auth-context";

import Loader from "components/loader";

export default function SignUpForm() {
  // Router to navigate after successful registration
  const router = useRouter();
  // User context to update the user data after successful registration
  const { updateUser } = useAuth();
  
  // State to handle error messages
  const [error, setError] = useState("");
  // State to manage the loading state of the form
  const [loading, setLoading] = useState(false);
  
  // State to handle form data (username, email, password, confirmPassword)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: ""
  });

  // Function to handle changes in form inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent the default form submission behavior
    setError(""); // Clear previous error messages

    // Check if password and confirmPassword match
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return; // Return if passwords don"t match
    };

    const formState = new FormData(e.target); // Collect form data
    const turnstileRes = formState.get("cf-turnstile-response"); // Get Turnstile token for bot protection

    // Check if Turnstile verification was successful
    if (!turnstileRes || turnstileRes === "error") {
      setError("Turnstile verification failed.");
      return; // Return if Turnstile verification fails
    };

    try {
      setLoading(true); // Set loading state to true while the request is being processed

      // Re-check Turnstile response before continuing
      if (!turnstileRes || turnstileRes === "error") {
        setError("Turnstile verification failed.");
        setLoading(false); // Reset loading state
        return; // Return if verification fails
      };

      // Send form data and Turnstile token to the server for challenge validation
      const response = await fetch("/api/auth/challenge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CHALLENGE_AUTH}`
        },
        body: JSON.stringify({
          token: turnstileRes, // Include Turnstile response
          ...formData // Include form data (username, email, password)
        })
      });

      // If the challenge response is successful, proceed with registration
      if (response.ok) {
        setLoading(true); // Keep loading state true while processing registration

        // Send user data to the server to create a new user
        const res = await fetch("/api/auth/user", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${process.env.NEXT_PUBLIC_CLIENT_AUTH}`
          },
          body: JSON.stringify({ ...formData }) // Include user data for registration
        });

        // Parse the response and handle registration result
        const data = await res.json();
        setLoading(false);

        // If registration is successful, update the user context and redirect to the user"s account page
        if (res.ok) {
          updateUser(data);
          router.push("/auth/my-account"); // Redirect to the user"s account page
          setLoading(false); // Reset loading state
        } else {
          setError(`Error: ${data.error}`); // Show error message if registration failed
          setLoading(false);
        };
      };
    } catch (error) {
      // Handle unexpected errors and set an error message
      setError("An unexpected error occurred.");
      console.error("Registration error:", error);
      setLoading(false);
    };
  };

  // Turnstile site key for Cloudflare bot protection
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY;

  return (
    <>
      {/* Load the Turnstile script from Cloudflare for bot verification */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" />
      <form onSubmit={handleSubmit}>
        <h2 className="mb-12">Sign up</h2>
        {/* Username input field */}
        <input name="username" placeholder="Username" type="text" onChange={handleChange} required />
        {/* Email input field */}
        <input name="email" placeholder="E-mail" type="email" onChange={handleChange} required />
        {/* Password input field */}
        <input name="password" placeholder="Password" type="password" onChange={handleChange} required />
        {/* Confirm password input field */}
        <input name="confirmPassword" placeholder="Confirm password" type="password" onChange={handleChange} required />
        {/* Turnstile widget for bot verification */}
        <div className="cf-turnstile" data-sitekey={TURNSTILE_SITE_KEY} data-callback="javascriptCallback" data-theme="dark" />
        {/* Display error message if any */}
        {error && <p className="u16">{error}</p>}
        {/* Submit button, shows loading indicator while processing */}
        <button className="u1 w-full h-11" type="submit" disabled={loading}>
          {loading ? <Loader /> : "Submit"}
        </button>
      </form>
    </>
  );
};