import React from "react";
import { FaSyncAlt } from "react-icons/fa";
import "./RefreshButton.css";

const RefreshButton = ({
  onRefresh,
  isLoading,
  size = "medium",
  variant = "primary",
  label = "Refresh",
  showLabel = true,
  ...props
}) => {
  return (
    <button
      className={`refresh-button ${size} ${variant} ${
        isLoading ? "loading" : ""
      }`}
      onClick={onRefresh}
      disabled={isLoading}
      {...props}
    >
      <span className="refresh-icon">
        <FaSyncAlt size={size === "small" ? 12 : 14} />
      </span>

      {showLabel && <span className="refresh-label">{label}</span>}
    </button>
  );
};

export default RefreshButton;
