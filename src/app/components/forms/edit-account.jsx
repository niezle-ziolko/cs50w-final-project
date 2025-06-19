"use client";
import { useState, useRef, useEffect } from "react";
import { useAuth } from "context/auth-context";
import Loader from "components/loader";

export default function EditForm() {
  const { updateUser, user } = useAuth();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user?.photo || "");
  const [imageFile, setImageFile] = useState(null);
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
    }
  }, [user]);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result);
      reader.readAsDataURL(file);
    };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");

      return;
    };

    try {
      setLoading(true);
      const payload = new FormData();
      Object.entries(formData).forEach(([key, value]) => {
        if (value.trim() !== "") payload.append(key, value);
      });
      if (imageFile) payload.append("photo", imageFile);

      const res = await fetch("/api/auth/user", {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${process.env.NEXT_PUBLIC_CLIENT_AUTH}`
        },
        body: payload
      });

      const data = await res.json();
      setLoading(false);

      if (res.ok) {
        updateUser(data);
      } else {
        setError(`Error: ${data.error || "Failed to update user."}`);
      }
    } catch (error) {
      setError("An unexpected error occurred.");
      setLoading(false);
    };
  };

  const passwordsMatch = !formData.password || formData.password === formData.confirmPassword;

  return (
    <div className="w-full md:w-97 relative">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <h2 className="text-2xl font-bold mb-8">Edit your data</h2>

        {/* Profile Picture Upload */}
        <div className="relative w-48 h-48 mx-auto cursor-pointer" onClick={handleImageClick}>
          <img className="w-48 h-48 rounded-full object-cover" src={preview || user?.photo} alt="profile-picture" />
          <div className="u1 absolute inset-0 bg-black rounded-full opacity-0 hover:opacity-50 transition-opacity z-10">
            <i className="fa-regular fa-image text-white text-3xl" />
          </div>
          <input
            type="file"
            accept="image/*"
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

        {/* Info Text */}
        <span>Enter only the data you want to change.</span>

        {/* Error Message */}
        {error && <p className="u18">{error}</p>}

        {/* Submit Button */}
        <button type="submit" disabled={loading}>
          {loading ? <Loader /> : "Submit"}
        </button>
      </form>
    </div>
  );
};