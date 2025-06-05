import React, { useEffect, useState } from "react";
import ThemeLogo from "./ThemeLogo";
import "./LoadingScreen.css";

const LoadingScreen = ({ message = "Loading..." }) => {
  const getInitialTheme = () => {
    const attrTheme = document.documentElement.getAttribute("data-theme");
    if (attrTheme) return attrTheme;

    const local = localStorage.getItem("theme");
    if (local && local !== "system") return local;

    return window.matchMedia("(prefers-color-scheme: light)").matches
      ? "light"
      : "dark";
  };

  const [currentTheme, setCurrentTheme] = useState(getInitialTheme);

  useEffect(() => {
    // Get theme immediately on component mount
    const getInitialTheme = () => {
      // First check if theme is already set on document
      const documentTheme = document.documentElement.getAttribute("data-theme");
      if (documentTheme) {
        return documentTheme;
      }

      // Check localStorage
      const savedTheme = localStorage.getItem("theme");
      if (savedTheme && savedTheme !== "system") {
        return savedTheme;
      }

      // Check system preference
      if (
        window.matchMedia &&
        window.matchMedia("(prefers-color-scheme: light)").matches
      ) {
        return "light";
      }

      return "dark";
    };

    const theme = getInitialTheme();
    setCurrentTheme(theme);

    // Apply theme to document immediately if not already set
    if (!document.documentElement.getAttribute("data-theme")) {
      document.documentElement.setAttribute("data-theme", theme);
    }

    // Listen for theme changes during loading
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          const newTheme = document.documentElement.getAttribute("data-theme");
          if (newTheme && newTheme !== currentTheme) {
            setCurrentTheme(newTheme);
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, [currentTheme]);

  return (
    <div
      className={`loading-screen ${currentTheme}`}
      role="alert"
      aria-busy="true"
      data-theme={currentTheme}
    >
      <div className="loading-container">
        <div className="loading-brand">
          <ThemeLogo
            className="loading-logo pulse"
            size="large"
            withGlow={true}
          />
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
