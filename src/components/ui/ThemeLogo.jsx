import React from "react";
import { useTheme } from "../../context/ThemeContext";
import "./ThemeLogo.css";

const ThemeLogo = ({
  className = "",
  alt = "Decen",
  style = {},
  size = "medium",
  showBeta = true,
  ...props
}) => {
  const { theme } = useTheme();

  // Determine which logo to use based on the current theme
  const logoSrc =
    theme === "dark" ? "/assets/decent-dark.webp" : "/assets/decent-light.webp";

  // Determine size class
  const sizeClass =
    size === "small"
      ? "theme-logo-small"
      : size === "large"
      ? "theme-logo-large"
      : "theme-logo-medium";

  return (
    <div className={`theme-logo-container ${className}`} style={style}>
      <img
        src={logoSrc}
        alt={alt}
        className={`theme-logo ${sizeClass}`}
        {...props}
      />
      {showBeta && <span className="beta-label">BETA</span>}
    </div>
  );
};

export default ThemeLogo;
