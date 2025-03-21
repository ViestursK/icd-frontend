import React from "react";
import "./RefreshButton.css";

const RefreshButton = ({ onRefresh, isLoading }) => {
  return (
    <button className="refresh-button" onClick={onRefresh} disabled={isLoading}>
      {isLoading ? (
        <div className="spinner"></div>
      ) : (
        "Refresh"
      )}
    </button>
  );
};

export default RefreshButton;
