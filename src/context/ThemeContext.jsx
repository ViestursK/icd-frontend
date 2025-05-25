import React, { createContext, useContext, useState, useEffect } from "react";

// Create theme context
const ThemeContext = createContext(null);

// Theme provider component
export const ThemeProvider = ({ children }) => {
  // Initialize theme from localStorage or system preference
  const [theme, setTheme] = useState(() => {
    // First try to get from localStorage
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme) return savedTheme;

    // Then check system preference
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-color-scheme: light)").matches
    ) {
      return "light";
    }

    // Default to dark theme
    return "dark";
  });

  // Apply theme to document when theme changes
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Listen for system preference changes
  useEffect(() => {
    const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");

    const handleChange = (e) => {
      // Only update if user hasn't explicitly set a preference
      if (!localStorage.getItem("theme")) {
        setTheme(e.matches ? "light" : "dark");
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
  }, []);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme((prevTheme) => (prevTheme === "dark" ? "light" : "dark"));
  };

  // Set specific theme
  const setThemeMode = (mode) => {
    if (mode === "light" || mode === "dark" || mode === "system") {
      if (mode === "system") {
        // Remove from localStorage and use system preference
        localStorage.removeItem("theme");
        const isLight =
          window.matchMedia &&
          window.matchMedia("(prefers-color-scheme: light)").matches;
        setTheme(isLight ? "light" : "dark");
      } else {
        setTheme(mode);
      }
    }
  };

  // Context value
  const contextValue = {
    theme,
    isDark: theme === "dark",
    isLight: theme === "light",
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
