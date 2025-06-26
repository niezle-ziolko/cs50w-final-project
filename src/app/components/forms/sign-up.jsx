"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

import { decryptUser } from "../../utils";
import { useAuth } from "context/auth-context";
import { useTheme } from "context/theme-context";
import { createApolloClient } from "client/client";
import { REGISTER_MUTATION } from "client/mutations";

import Loader from "components/loader";

export default function SignUpForm() {
  // Router to navigate after successful registration
  const router = useRouter();
  // User context to update the user data after successful registration
  const { updateUser } = useAuth();
  const { isDarkMode } = useTheme();
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
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const formState = new FormData(e.target);
      const turnstileToken = formState.get("cf-turnstile-response");

      if (!turnstileToken || turnstileToken === "error") {
        setError("Turnstile verification failed.");
        setLoading(false);

        return;
      };

      const client = createApolloClient(turnstileToken);

      const { data } = await client.mutate({
        mutation: REGISTER_MUTATION,
        variables: {
          credentials: {
            username: formData.username,
            password: formData.password,
            email: formData.email
          }
        }
      });
  
      const token = data?.registerUser?.data;

      if (!token) {
        throw new Error("No user returned from server.");
      };
  
      const userData = await decryptUser(token);
  
      updateUser(userData);
      router.push("/auth/my-account");
    } catch (err) {
      console.error("Register error:", err);
      setError("Register failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    };
  };

  // Turnstile site key for Cloudflare bot protection
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY;
  // Check if the password is empty or matches the confirmation password.
  const passwordsMatch = !formData.password || formData.password === formData.confirmPassword;
  // loader background color
  const color = "black";

  return (
    <>
      {/* Load the Turnstile script from Cloudflare for bot verification */}
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" />
      <form className="md:w-97" onSubmit={handleSubmit}>
        <h2 className="mb-12">Sign up</h2>

        {/* Username input field */}
        <input
          required
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={formData.username}
        />

        {/* Email Input */}
        <input
          name="email"
          type="email"
          placeholder="Email"
          value={formData.email}
          onChange={handleChange}
        />

        {/* Password Input */}
        <input
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          className={`${!passwordsMatch ? "border-(--color-r-100)" : ""}`}
        />

        {/* Confirm Password Input */}
        <input
          type="password"
          name="confirmPassword"
          onChange={handleChange}
          placeholder="Confirm password"
          className={`${!passwordsMatch ? "border-(--color-r-100)" : ""}`}
        />
        
        {/* Turnstile widget for bot verification */}
        <div
          className="cf-turnstile"
          data-sitekey={TURNSTILE_SITE_KEY}
          data-callback="javascriptCallback"
          data-theme={isDarkMode ? "dark" : "light"}
        />

        {/* Display error message if any */}
        {error && <p className="u18">{error}</p>}

        {/* Submit button, shows loading indicator while processing */}
        <button type="submit" disabled={loading}>
          {loading ? <Loader color={color} /> : "Submit"}
        </button>
      </form>
    </>
  );
};