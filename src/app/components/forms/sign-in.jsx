"use client";
import { useState } from "react";
import Script from "next/script";
import { useRouter } from "next/navigation";

import { decryptUser } from "../../utils";
import { useAuth } from "context/auth-context";
import { useTheme } from "context/theme-context";
import { LOGIN_MUTATION } from "client/mutations";
import { apolloClient } from "client/client";

import Loader from "components/loader";

export default function SignInForm() {
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
    password: ""
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

      const client = apolloClient(turnstileToken);

      const { data } = await client.mutate({
        mutation: LOGIN_MUTATION,
        variables: {
          credentials: {
            username: formData.username,
            password: formData.password
          }
        }
      });

      const token = data?.loginUser?.data;

      if (!token) {
        throw new Error("No user returned from server.");
      };

      window.localStorage.setItem("token", token);
      const userData = await decryptUser(token);

      updateUser(userData);
      router.push("/auth/my-account");
    } catch (err) {
      console.error("Login error:", err);
      setError("Login failed. Please check your credentials and try again.");
    } finally {
      setLoading(false);
    };
  };

  // Turnstile site key for Cloudflare bot protection
  const TURNSTILE_SITE_KEY = process.env.NEXT_PUBLIC_SITE_KEY;
  // loader background color
  const color = "black";

  return (
    <>
      <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      <form className="md:w-97" onSubmit={handleSubmit}>
        <h2 className="mb-12">Sign in</h2>

        <input
          required
          type="text"
          name="username"
          placeholder="Username"
          onChange={handleChange}
          value={formData.username}
        />

        <input
          required
          name="password"
          type="password"
          placeholder="Password"
          onChange={handleChange}
          value={formData.password}
        />

        <div
          className="cf-turnstile"
          data-sitekey={TURNSTILE_SITE_KEY}
          data-theme={isDarkMode ? "dark" : "light"}
        />

        {error && <p className="u18 text-red-500">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? <Loader color={color} /> : "Submit"}
        </button>
      </form>
    </>
  );
};