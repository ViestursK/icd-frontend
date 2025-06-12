import React, { createContext, useContext, useState, useEffect } from "react";

// Create theme context
const ThemeContext = createContext(null);

// Initialize theme immediately before React renders
const getInitialTheme = () => {
  // TEMPORARILY DISABLED - DARK THEME ONLY
  // Uncomment below to restore original light/dark theme functionality
  
  /*
  // First check if already set on document
  const documentTheme = document.documentElement.getAttribute("data-theme");
  if (documentTheme) {
    return documentTheme;
  }

  // Check localStorage
  const savedTheme = localStorage.getItem("theme");
  if (savedTheme && savedTheme !== "system") {
    // Apply immediately to prevent flash
    document.documentElement.setAttribute("data-theme", savedTheme);
    return savedTheme;
  }

  // Check system preference
  const prefersDark =
    window.matchMedia &&
    window.matchMedia("(prefers-color-scheme: dark)").matches;
  const systemTheme = prefersDark ? "dark" : "light";

  // Apply immediately to prevent flash
  document.documentElement.setAttribute("data-theme", systemTheme);
  return systemTheme;
  */

  // NEW LOGIC - FORCE DARK THEME ONLY
  document.documentElement.setAttribute("data-theme", "dark");
  return "dark";
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme with immediate application
  const [theme, setTheme] = useState(() => getInitialTheme());

  // Apply theme to document when theme changes
  useEffect(() => {
    // TEMPORARILY DISABLED - DARK THEME ONLY
    // Uncomment below to restore original functionality
    
    /*
    document.documentElement.setAttribute("data-theme", theme);

    // Only save to localStorage if it's not system preference
    if (theme !== "system") {
      localStorage.setItem("theme", theme);
    }
    */

    // NEW LOGIC - FORCE DARK THEME ONLY
    document.documentElement.setAttribute("data-theme", "dark");
    // Clear any existing theme preferences
    localStorage.removeItem("theme");
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    // TEMPORARILY DISABLED - DARK THEME ONLY
    // Uncomment below to restore original functionality
    
    /*
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

    const handleChange = (e) => {
      // Only update if user hasn't explicitly set a preference
      const savedTheme = localStorage.getItem("theme");
      if (!savedTheme || savedTheme === "system") {
        const newTheme = e.matches ? "dark" : "light";
        setTheme(newTheme);
      }
    };

    // Add listener for preference changes
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else {
      // Fallback for older browsers
      mediaQuery.addListener(handleChange);
    }

    // Cleanup
    return () => {
      if (mediaQuery.removeEventListener) {
        mediaQuery.removeEventListener("change", handleChange);
      } else {
        // Fallback for older browsers
        mediaQuery.removeListener(handleChange);
      }
    };
    */

    // NEW LOGIC - NO SYSTEM PREFERENCE LISTENING (DARK ONLY)
    // Do nothing - theme stays dark
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    // TEMPORARILY DISABLED - DARK THEME ONLY
    // Uncomment below to restore original functionality
    
    /*
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
    */

    // NEW LOGIC - DISABLE TOGGLE (DARK ONLY)
    console.log("Theme toggle disabled - dark theme only");
  };

  // Set specific theme
  const setThemeMode = (mode) => {
    // TEMPORARILY DISABLED - DARK THEME ONLY
    // Uncomment below to restore original functionality
    
    /*
    if (mode === "light" || mode === "dark") {
      setTheme(mode);
    } else if (mode === "system") {
      // Remove from localStorage and use system preference
      localStorage.removeItem("theme");
      const prefersDark =
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: dark)").matches;
      const systemTheme = prefersDark ? "dark" : "light";
      setTheme(systemTheme);
    }
    */

    // NEW LOGIC - DISABLE THEME SWITCHING (DARK ONLY)
    console.log("Theme switching disabled - dark theme only");
  };

  // Context value
  const contextValue = {
    // TEMPORARILY DISABLED - DARK THEME ONLY
    // Uncomment below to restore original functionality
    
    /*
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
    toggleTheme,
    setTheme: setThemeMode,
    */

    // NEW LOGIC - FORCE DARK THEME VALUES
    theme: "dark",
    isDark: true,
    isLight: false,
    toggleTheme,
    setTheme: setThemeMode,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

// Hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);

  if (!context) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }

  return context;
};

export default ThemeContext;