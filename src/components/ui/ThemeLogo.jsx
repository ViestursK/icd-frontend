import React from "react";
import { useTheme } from "../../context/ThemeContext";

const ThemeLogo = ({
  className = "",
  alt = "Decen",
  style = {},
  size = "medium",
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
    <img
      src={logoSrc}
      alt={alt}
      className={`theme-logo ${sizeClass} ${className}`}
      style={style}
      {...props}
    />
  );
};

export default ThemeLogo;
