"use client";
import { useState } from "react";
import { useAuth } from "context/auth-context";

import AIIcon from "styles/icons/ai";
import Loader from "components/loader";

import "styles/css/components/forms.css";

export default function CreateForm() {
  // State to manage form data, loading state, error messages, file names, etc.
  const { updateUser, user } = useAuth();
  const [formData, setFormData] = useState({
    username: "",
    title: "",
    description: "",
    audio: [],
    textFiles: [],
    image: null
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [imageName, setImageName] = useState("No file chosen");
  const [fileNames, setFileNames] = useState([]);
  const [isTextMode, setIsTextMode] = useState(false); // Toggle between text and audio file input modes

  // Handles changes in form fields, updates state for file inputs and text fields
  const handleChange = (e) => {
    const { name, type, files, value } = e.target;
    
    if (type === "file") {
      if (name === "image") {
        // Handle image file input
        setImageName(files[0]?.name || "No file chosen");
        setFormData((prev) => ({ ...prev, image: files[0] || null }));
      } else if (name === "fileUpload") {
        // Handle audio or text file input based on mode
        const newFiles = Array.from(files);
        setFileNames((prev) => [...prev, ...newFiles.map((file) => file.name)]);
        setFormData((prev) => ({
          ...prev,
          [isTextMode ? "textFiles" : "audio"]: [...prev[isTextMode ? "textFiles" : "audio"], ...newFiles],
        }));
      };
    } else {
      // Update form data for text inputs
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  };

  // Handles form submission, sends form data to the appropriate API endpoint
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Ensure the user has a username before submitting the form
    if (!user?.username) {
      setError("You must have a username to submit this form.");
      return;
    };

    setLoading(true);

    // Prepare form data for submission
    const data = new FormData();
    data.append("username", user.username);
    data.append("title", formData.title);
    data.append("description", formData.description);
    formData.audio.forEach((file) => data.append("audio", file));
    formData.textFiles.forEach((file) => data.append("textFiles", file));
    if (formData.image) data.append("image", formData.image);

    // Determine the endpoint based on the input mode (text or audio)
    const endpoint = isTextMode ? "/api/data/ai" : "/api/data/book";

    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_BOOK_AUTH}`
        },
        body: data
      });

      const responseData = await response.json();
      setLoading(false);

      if (response.ok) {
        // If submission is successful, update the user state with the response data
        updateUser(responseData);
        console.log("Form submitted successfully");
      } else {
        // Set error message if the response is not successful
        setError(`Error: ${responseData.error || "Failed to create book."}`);
        setLoading(false);
      };
    } catch (error) {
      // Handle unexpected errors
      setError("An unexpected error occurred.");
      console.error("Create error:", error);
      setLoading(false);
    };
  };

  return (
    <div className="form create-book u23">
      <form className="form" style={{ position: "absolute" }} onSubmit={handleSubmit}>
        <p className="heading">Create your book</p>
        <div className="box">
          {/* File input for audio or text files, depending on mode */}
          <label className="file-upload">
            <input 
              type="file" 
              name="fileUpload" 
              accept={isTextMode ? "text/plain" : "audio/mp3"} 
              multiple 
              onChange={handleChange} 
            />
            <span>Select {isTextMode ? "Text Files (.txt)" : "Audio Files (.mp3)"}</span>
          </label>
          <p className="file-name">{fileNames.length > 0 ? fileNames.join(", ") : "No files chosen"}</p>
        </div>
        <div className="box">
          {/* File input for image upload */}
          <label className="file-upload">
            <input type="file" name="image" accept="image/*" onChange={handleChange} />
            <span>Select Cover Image</span>
          </label>
          <p className="file-name">{imageName}</p>
        </div>
        {/* Text input for book title */}
        <input className="input" name="title" placeholder="Title" type="text" value={formData.title} onChange={handleChange} />
        {/* Textarea for book description */}
        <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} />
        {/* Display error message if any */}
        {error && <p className="error-message">{error}</p>}
        {/* Submit button, shows loading indicator when in loading state */}
        <button className="button" type="submit" disabled={loading}>
          {loading ? <Loader /> : "Submit"}
        </button>
        {/* Toggle between text and audio mode */}
        <AIIcon onClick={() => setIsTextMode((prev) => !prev)} />
      </form>
    </div>
  );
};