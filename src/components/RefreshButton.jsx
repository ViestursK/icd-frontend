import React, { useState } from "react";
import "./RefreshButton.css";

function RefreshButton({ onRefresh, isLoading }) {
  return (
    <button onClick={onRefresh} className="refresh-button" disabled={isLoading}>
      {isLoading ? <span className="spinner"></span> : "Refresh Wallets"}
    </button>
  );
}

export default RefreshButton;
