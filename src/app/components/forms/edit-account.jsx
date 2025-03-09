'use client';
import { useState, useRef, useEffect } from 'react';
import { useAuth } from 'context/auth-context';

import Loader from 'components/loader';

import 'styles/css/components/forms.css';

export default function EditForm() {
  // State to manage the form data, loading state, error message, image preview, and image file
  const { updateUser, user } = useAuth();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(user?.photo || ''); // Default to user photo if available
  const [imageFile, setImageFile] = useState(null);
  const [formData, setFormData] = useState({
    username: user?.username,
    email: '',
    password: '',
    confirmPassword: ''
  });

  const fileInputRef = useRef(null); // Reference to the hidden file input for the image

  // Update the form data when user data is available
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        username: user.username // Set username if user data is available
      }));
    };
  }, [user]);

  // Handle changes in text input fields (email, password, etc.)
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Trigger the file input when the user clicks on the profile picture area
  const handleImageClick = () => {
    fileInputRef.current.click();
  };

  // Handle the image file input change (file selection)
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file); // Store the selected image file
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result); // Display the selected image as a preview
      reader.readAsDataURL(file);
    };
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); // Clear any previous error messages

    // Validate if the passwords match
    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Passwords do not match!');
      return;
    };

    try {
      setLoading(true); // Set loading state to true
      const payload = new FormData();

      // Append all form data (excluding empty values) to the FormData object
      Object.entries(formData).forEach(([key, value]) => {
        if (value.trim() !== '') payload.append(key, value);
      });
      if (imageFile) payload.append('photo', imageFile); // Append the new photo if selected

      // Send the form data to the server
      const res = await fetch('/api/auth/user', {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_CLIENT_AUTH}`
        },
        body: payload
      });

      const data = await res.json();
      setLoading(false); // Set loading state to false after the request is completed

      if (res.ok) {
        // If the request was successful, update the user data
        updateUser(data);
      } else {
        // If the request failed, set the error message
        setError(`Error: ${data.error || 'Failed to update user.'}`);
        setLoading(false);
      };
    } catch (error) {
      // Handle any unexpected errors
      setError('An unexpected error occurred.');
      setLoading(false);
    };
  };

  return (
    <div className='form edit'>
      <form className='form' style={{ position: 'absolute' }} onSubmit={handleSubmit}>
        <p className='heading'>Edit your data</p>
        <div className='box'>
          <div className='picture' onClick={handleImageClick} style={{ cursor: 'pointer' }}>
            {/* Display profile picture or preview of the selected image */}
            {preview ? (
              <img src={preview} alt='profile-picture' width='200' height='200' style={{ borderRadius: '100%' }} />
            ) : (
              <img src={user?.photo} alt='profile-picture' width='200' height='200' style={{ borderRadius: '100%' }} />
            )}
            <div className='background-icon'>
              <i className='fa-regular fa-image' id='icon' />
            </div>
          </div>
          {/* Hidden file input that triggers when the picture div is clicked */}
          <input type='file' ref={fileInputRef} style={{ display: 'none' }} onChange={handleImageChange} accept='image/*' />
        </div>
        {/* Text input for the email */}
        <input className='input' name='email' placeholder={user?.email} type='email' value={formData.email} onChange={handleChange} />
        {/* Password input */}
        <input className='input' name='password' placeholder='Password' type='password' onChange={handleChange} />
        {/* Confirm password input */}
        <input className='input' name='confirmPassword' placeholder='Confirm password' type='password' onChange={handleChange} />
        {/* Instructions for the user */}
        <span className='span'>Enter only the data you want to change.</span>
        {/* Error message display */}
        {error && <p className='error-message'>{error}</p>}
        {/* Submit button, shows loading indicator if loading */}
        <button className='button' type='submit' disabled={loading}>
          {loading ? <Loader /> : 'Submit'}
        </button>
      </form>
    </div>
  );
};