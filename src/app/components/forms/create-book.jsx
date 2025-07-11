"use client";
import { useState } from "react";

import { apolloClient } from "client/client";
import { useAuth } from "context/auth-context";
import { CREATE_BOOK_MUTATION } from "client/mutations";
import { decryptUser, fileToBase64 } from "../../utils";

import Loader from "components/loader";
import AIButton from "components/buttons/ai-button";

export default function CreateForm() {
  const { updateUser, user } = useAuth();
  const [formData, setFormData] = useState({
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
  const [isTextMode, setIsTextMode] = useState(false);

  const handleChange = (e) => {
    const { name, type, files, value } = e.target;

    if (type === "file") {
      if (name === "image") {
        const file = files?.[0];
        setImageName(file?.name || "No file chosen");
        setFormData((prev) => ({ ...prev, image: file || null }));
      } else if (name === "fileUpload") {
        const newFiles = Array.from(files || []);
        setFileNames((prev) => [...prev, ...newFiles.map((file) => file.name)]);
        setFormData((prev) => ({
          ...prev,
          [isTextMode ? "textFiles" : "audio"]: [
            ...prev[isTextMode ? "textFiles" : "audio"],
            ...newFiles,
          ]
        }));
      };
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    };
  };

  const validateForm = () => {
    if (!formData.title.trim()) {
      setError("Title is required");
      return false;
    };

    if (!formData.description.trim()) {
      setError("Description is required");
      return false;
    };

    if (!formData.image) {
      setError("Cover image is required");
      return false;
    };

    if (formData.audio.length === 0 && formData.textFiles.length === 0) {
      setError("At least one audio or text file is required");
      return false;
    };

    if (!user?.username) {
      setError("You must have a username to submit this form");
      return false;
    };

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    };

    setLoading(true);

    try {      
      // Convert image to base64
      let imageBase64 = null;
      if (formData.image) {
        imageBase64 = await fileToBase64(formData.image);
      };

      // Convert audio files to base64
      const filesToProcess = isTextMode ? formData.textFiles : formData.audio;
      
      const audioFilesBase64 = [];
      for (const file of filesToProcess) {
        try {
          const base64 = await fileToBase64(file);

          if (base64 && base64.trim()) {
            audioFilesBase64.push(base64);
          };
        } catch (fileError) {
          console.error("Error converting file:", file.name, fileError);
          // Continue with other files
        };
      };

      if (audioFilesBase64.length === 0) {
        setError("Failed to process any files. Please try again.");
        return;
      };

      const auth = localStorage.getItem("token");

      if (!auth) {
        setError("Authentication token missing. Please log in again.");
        return;
      };

      const client = apolloClient(auth);

      const mutationInput = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        username: user.username,
        imageBase64,
        audioFilesBase64
      };

      const { data } = await client.mutate({
        mutation: CREATE_BOOK_MUTATION,
        variables: {
          input: mutationInput
        },
        errorPolicy: "all" // This will help capture more error details
      });

      const token = data?.createBook?.data;

      if (!token) {
        console.error("Server response:", data);
        throw new Error("No user data returned from server.");
      };

      // Decrypt and update user data
      const userData = await decryptUser(token);
      updateUser(userData);
      setLoading(false);

      // Reset form
      setFormData({
        title: "",
        description: "",
        audio: [],
        textFiles: [],
        image: null
      });
      setImageName("No file chosen");
      setFileNames([]);

      // You might want to redirect or show success message here
      alert("Book created successfully!");
    } catch (err) {
      console.error("Full error object:", err);
      
      // More detailed error handling
      if (err.graphQLErrors && err.graphQLErrors.length > 0) {
        const graphQLError = err.graphQLErrors[0];
        setError(graphQLError.message || "GraphQL error occurred");
      } else if (err.networkError) {
        setError("Network error. Please check your connection.");
      } else if (err.message) {
        setError(err.message);
      } else {
        setError("An unexpected error occurred.");
      };
    } finally {
      setLoading(false);
    };
  };

  const removeFile = (index, type) => {
    if (type === "audio") {
      setFormData(prev => ({
        ...prev,
        audio: prev.audio.filter((_, i) => i !== index)
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        textFiles: prev.textFiles.filter((_, i) => i !== index)
      }));
    };

    setFileNames(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="u23">
      <form onSubmit={handleSubmit}>
        <h2 className="u21">Create your book</h2>

        <input
          type="text"
          name="title"
          placeholder="Title"
          value={formData.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          onChange={handleChange}
          placeholder="Description"
          value={formData.description}
          required
        />

        <div className="w-full">
          <label className="u25">
            <p>Choose cover image *</p>
            <input
              type="file"
              name="image"
              accept="image/*"
              className="hidden"
              onChange={handleChange}
              required
            />
          </label>
          <span className="u24">{imageName}</span>
        </div>

        <div className="w-full">
          <label className="u25">
            <p>{isTextMode ? "Choose file (.txt) *" : "Choose file (.mp3) *"}</p>
            <input
              multiple
              type="file"
              name="fileUpload"
              className="hidden"
              onChange={handleChange}
              accept={isTextMode ? "text/plain" : "audio/mp3,audio/mpeg"}
              required
            />
          </label>
          <div className="u24">
            {fileNames.length > 0 ? (
              <div>
                {fileNames.map((name, index) => (
                  <div key={index} className="flex justify-between items-center">
                    <span>{name}</span>
                    <span className="font-bold cursor-pointer" type="button" onClick={() => removeFile(index, isTextMode ? "text" : "audio")}>
                      Remove
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              "No files chosen"
            )}
          </div>
        </div>

        {error && <p className="u18 text-red-500">{error}</p>}

        <button type="submit" disabled={loading}>
          {loading ? <Loader color="black" /> : "Submit"}
        </button>

        <AIButton onClick={() => setIsTextMode((prev) => !prev)} />
      </form>
    </div>
  );
};