"use client";
import { useState, useEffect } from "react";

import { decryptUser } from "../../utils";
import { useAuth } from "context/auth-context";
import { useAudio } from "context/audio-context";
import { apolloClient } from "client/client";
import { LIKE_MUTATION, UNLIKE_MUTATION } from "client/mutations";

export default function LikeButton({ externalBookId }) {
  // Retrieve internal book ID from the audio context and user data from the auth context
  const { bookId: internalBookId } = useAudio();
  const { user, updateUser } = useAuth();

  // Use externalBookId if provided, otherwise fallback to internalBookId
  const bookId = externalBookId || internalBookId;
  const [isLiked, setIsLiked] = useState(false);

  // Effect hook to check if the current user has liked the book
  useEffect(() => {
    // If user has no liked books or no bookId, reset isLiked to false
    if (!user?.liked || !bookId) {
      setIsLiked(false);
      return;
    };

    // Split the liked books string into an array and check if the current bookId is liked
    const likedBooks = user.liked.split(", ");
    setIsLiked(likedBooks.includes(bookId));
  }, [bookId, user?.liked]); // Re-run effect when bookId or liked books list changes

  // Handle the like/unlike action
  const handleLike = async () => {
    // If no bookId or user, prevent action
    if (!bookId || !user) return;

    try {
      // Determine the method based on whether the book is liked or not
      const method = isLiked ? UNLIKE_MUTATION : LIKE_MUTATION;

      const auth = window.localStorage.getItem("token");
      const client = apolloClient(auth);
          
      const { data } = await client.mutate({
        mutation: method,
        variables: {
          bookId: bookId,
          userId: user.id
        }
      });

      const token = data?.addLike?.data || data?.removeLike?.data;

      if (!token) {
        throw new Error("No like data returned from server.");
      };
      
      // Decrypt and update user data
      const userData = await decryptUser(token);
      updateUser(userData);

      // Toggle the liked state and log success message
      setIsLiked(!isLiked);
      console.log(`Book ${isLiked ? "unliked" : "liked"} successfully`);
    } catch (error) {
      // Log any errors during the fetch operation
      console.error("error:", error);
    };
  };

  return (
    <div className="u1 text-r-100" onClick={handleLike}>
      <i className={`fa-regular fa-heart ${isLiked ? "before:font-bold" : "before:font-normal"} text-xl cursor-pointer transition-400 transition-all`} />
    </div>
  );
};