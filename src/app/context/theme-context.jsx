"use client";
import { createContext, useContext, useEffect, useState } from "react";

// Create a ThemeContext to manage the theme state globally (light/dark mode)
const ThemeContext = createContext();

export function ThemeProvider({ children }) {
  // State to store whether dark mode is enabled or not
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Check if the user prefers dark mode based on the system"s color scheme
    const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;

    // Get the stored theme from localStorage (if any)
    const storedTheme = localStorage.getItem("theme");
    
    // If a theme is stored, use that. Otherwise, fall back to system preference.
    if (storedTheme) {
      setIsDarkMode(storedTheme === "dark");
    } else {
      setIsDarkMode(prefersDark);
    };
  }, []);

  useEffect(() => {
    // If dark mode is enabled, set data-theme="dark" attribute, otherwise set data-theme="light"
    if (isDarkMode) {
      document.documentElement.setAttribute("data-theme", "dark"); // Apply dark mode styles globally
      localStorage.setItem("theme", "dark"); // Save dark mode preference in localStorage
    } else {
      document.documentElement.setAttribute("data-theme", "light"); // Apply light mode styles
      localStorage.setItem("theme", "light"); // Save light mode preference in localStorage
    };
  }, [isDarkMode]);

  return (
    // Provide the theme context to child components
    <ThemeContext.Provider value={{ isDarkMode, setIsDarkMode }}>
      {children} {/* Render child components with access to the theme context */}
    </ThemeContext.Provider>
  );
};

// Custom hook to access the theme context in other components
export function useTheme() {
  return useContext(ThemeContext); // Return the current theme context value
};