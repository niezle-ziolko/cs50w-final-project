"use client";
import { createContext, useContext, useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";

const AuthContext = createContext();

export function AuthProvider({ children }) {
  // State to store user data and loading status
  const [user, setUser] = useState(null); // Stores the authenticated user data
  const [isLoading, setIsLoading] = useState(true); // Stores loading status while checking authentication
  const router = useRouter(); // Next.js router for navigation
  const pathname = usePathname(); // Gets the current path in the app

  useEffect(() => {
    const storedUser = localStorage.getItem("user"); // Retrieve user data from localStorage
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser); // Parse the stored user data
        const expiresDate = new Date(userData.expiresDate); // Get the expiration date from stored data
        const currentDate = new Date(); // Get the current date

        const diffTime = currentDate - expiresDate; // Calculate the difference between the current and expiration dates
        const diffDays = diffTime / (1000 * 3600 * 24); // Convert the difference to days

        // If the user session is expired (older than 7 days), remove the user data from localStorage
        if (diffDays > 7) {
          localStorage.removeItem("user");
          setUser(null);
        } else {
          setUser(userData); // Set the user data if it"s valid
        };
      } catch (error) {
        console.error("Error parsing session data:", error); // Handle errors in parsing the session data
      };
    };

    setIsLoading(false); // Set loading to false once the authentication check is done
  }, []);

  useEffect(() => {
    if (!isLoading) {
      // If the user is not authenticated, redirect them to the login page
      if (!user && ["/auth/my-account", "/auth/library", "/auth/my-books", "/auth/create-book"].includes(pathname)) {
        router.push("/auth/login");
      } 
      // If the user is not authenticated and trying to access a specific library page, redirect to login
      else if (!user && pathname.startsWith("/auth/library/")) {
        router.push("/auth/login");
      }
      // If the user is authenticated and trying to access the login or register pages, redirect to the user account page
      else if (user && ["/auth/login", "/auth/register"].includes(pathname)) {
        router.push("/auth/my-account");
      };
    };
  }, [user, pathname, router, isLoading]);

  // Function to update the user data and store it in localStorage
  const updateUser = (data) => {
    localStorage.setItem("user", JSON.stringify(data)); // Save user data to localStorage
    setUser(data); // Update the user state
  };

  // Function to log the user out by clearing user data from localStorage
  const logoutUser = () => {
    // Remove all relevant data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("book-id");
    localStorage.removeItem("book-file");
    localStorage.removeItem("book-title");
    localStorage.removeItem("book-author");
    localStorage.removeItem("book-picture");
    localStorage.removeItem("book-description");
    setUser(null); // Set the user state to null (logged out)
  };

  return (
    // Provide the authentication context to the entire app
    <AuthContext.Provider value={{ user, updateUser, logoutUser }}>
      {children} {/* Render the children components with access to the authentication context */}
    </AuthContext.Provider>
  );
};

// Custom hook to access the authentication context in other components
export function useAuth() {
  return useContext(AuthContext); // Return the current context value
};