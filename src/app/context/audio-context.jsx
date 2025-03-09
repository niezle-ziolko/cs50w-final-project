'use client';
import { createContext, useState, useContext, useEffect } from 'react';

const AudioContext = createContext({
  bookId: null,
  bookFile: null,
  bookTitle: null,
  bookAuthor: null,
  bookPicture: null,
  bookDescription: null,
  setBookId: () => {},
  setBookFile: () => {},
  setBookTitle: () => {},
  setBookAuthor: () => {},
  setBookPicture: () => {},
  setBookDescription: () => {}
});

const useLocalStorageState = (key, initialValue) => {
  // State initialization logic: retrieve from localStorage if available or use initialValue
  const [state, setState] = useState(() => {
    if (typeof window !== 'undefined') {
      // Check if window is available (for client-side only)
      return localStorage.getItem(key) || initialValue;
    };

    return initialValue; // Default value if window is not available (e.g., server-side rendering)
  });

  useEffect(() => {
    if (state) {
      // Save to localStorage if there's state
      localStorage.setItem(key, state);
    } else {
      // Remove from localStorage if state is null/undefined
      localStorage.removeItem(key);
    };
  }, [key, state]);

  return [state, setState]; // Return the state and the function to update it
};

export function AudioProvider({ children }) {
  // Use the custom hook to manage state and persist values in localStorage
  const [bookId, setBookId] = useLocalStorageState('book-id', null);
  const [bookFile, setBookFile] = useLocalStorageState('book-file', null);
  const [bookTitle, setBookTitle] = useLocalStorageState('book-title', null);
  const [bookAuthor, setBookAuthor] = useLocalStorageState('book-author', null);
  const [bookPicture, setBookPicture] = useLocalStorageState('book-picture', null);
  const [bookDescription, setBookDescription] = useLocalStorageState('book-description', null);

  return (
    <AudioContext.Provider
      value={{
        bookId,
        setBookId,
        bookFile,
        setBookFile,
        bookTitle,
        setBookTitle,
        bookAuthor,
        setBookAuthor,
        bookPicture,
        setBookPicture,
        bookDescription,
        setBookDescription
      }}
    >
      {children} {/* Render the children components with access to audio state */}
    </AudioContext.Provider>
  );
};

// Custom hook to use audio context data
export function useAudio() {
  // Access the AudioContext to retrieve audio-related data and functions
  const context = useContext(AudioContext);

  // Throw an error if this hook is used outside the AudioProvider
  if (!context) {
    throw new Error('useAudio must be used within an AudioProvider');
  };

  return context; // Return the context values (audio state and setters)
};