"use client";
import { useState, useRef, useEffect } from "react";

import { decryptUser } from "../../utils";
import { useAuth } from "context/auth-context";
import { UPDATE_MUTATION } from "client/mutations";
import { apolloClient } from "client/client";

import Loader from "components/loader";

export default function EditForm() {
  // User context to update the user data after successful registration
  const { updateUser, user } = useAuth();
  // State to handle error messages
  const [error, setError] = useState("");
  // State to manage the loading state of the form
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user?.photo || "");
  const [imageFile, setImageFile] = useState(null);
  // State to handle form data (username, email, password, confirmPassword)
  const [formData, setFormData] = useState({
    username: user?.username || "",
    email: user?.email || "",
    password: "",
    confirmPassword: ""
  });

  const fileInputRef = useRef(null);

  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username,
        email: user.email
      }));
    };
  }, [user]);

  // Function to handle changes in form inputs
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

      if (!allowedTypes.includes(file.type)) {
        setError("Unsupported image format. Allowed: JPEG, PNG, WebP");
        return;
      };

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        setError("Image size must be less than 5MB");
        return;
      };

      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
      setError(""); // Clear any previous errors
    };
  };

  // Function to convert file to base64
  const fileToBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result);
      reader.onerror = error => reject(error);
    });
  };

  // Function to handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      setLoading(false);
      return;
    };

    try {
      // Prepare credentials object for GraphQL mutation
      const credentials = {};
      
      // Only include fields that have values
      if (formData.email.trim() !== "") credentials.email = formData.email;
      if (formData.password.trim() !== "") {
        credentials.password = formData.password;
      };

      // Handle image file if selected
      if (imageFile) {
        try {
          const base64Image = await fileToBase64(imageFile);
          credentials.photo = base64Image;
        } catch (imageError) {
          throw new Error("Failed to process image file");
        };
      };

      const auth = window.localStorage.getItem("token");
      const client = apolloClient(auth);
    
      const { data } = await client.mutate({
        mutation: UPDATE_MUTATION,
        variables: {
          credentials: credentials
        }
      });

      const token = data?.updateUser?.data;

      if (!token) {
        throw new Error("No user data returned from server.");
      };

      // Decrypt and update user data
      const userData = await decryptUser(token);
      updateUser(userData);
      setLoading(false);

      // Optionally reset password fields
      setFormData(prev => ({
        ...prev,
        password: "",
        confirmPassword: ""
      }));

    } catch (error) {
      console.error("Update error:", error);      
      setLoading(false);
    };
  };

  const color = "black";
  const passwordsMatch = !formData.password || formData.password === formData.confirmPassword;
  const defaultImage = "https://pub-99725015ac6548d2b4f311643799fa78.r2.dev/images/users/default-profile-picture.webp";

  return (
    <div className="u23">
      <form onSubmit={handleSubmit}>
        <h2 className="u21">Edit your data</h2>

        {/* Profile Picture Upload */}
        <div className="relative w-48 h-48 mx-auto cursor-pointer" onClick={handleImageClick}>
          <img 
            className="w-48 h-48 rounded-full object-cover border-2 border-primary" 
            src={preview || user?.photo || `${defaultImage}`} 
            alt="profile-picture" 
            onError={(e) => {
              e.target.src = `${defaultImage}`;
            }}
          />
          <div className="u1 u26 rounded-full">
            <div className="w-15 h-15 p-5 bg-b-100 rounded-full">
              <i className="fa-regular fa-image text-white text-xl" />
            </div>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/jpg,image/png,image/webp"
            className="hidden"
            ref={fileInputRef}
            onChange={handleImageChange}
          />
        </div>

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
          value={formData.password}
          onChange={handleChange}
          className={`${!passwordsMatch ? "border-(--color-r-100)" : ""}`}
        />

        {/* Confirm Password Input */}
        <input
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          placeholder="Confirm password"
          className={`${!passwordsMatch ? "border-(--color-r-100)" : ""}`}
        />

        {/* Info Text */}
        <span className="u24">Enter only the data you want to change.</span>

        {/* Error Message */}
        {error && <p className="u18">{error}</p>}

        {/* Submit Button */}
        <button type="submit" disabled={loading || !passwordsMatch}>
          {loading ? <Loader color={color} /> : "Submit"}
        </button>
      </form>
    </div>
  );
};