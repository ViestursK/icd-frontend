import React from "react";
import logo from "../../assets/logo.svg";
import "./LoadingScreen.css";

const LoadingScreen = ({ message = "Loading..." }) => {
  return (
    <div className="loading-screen" role="alert" aria-busy="true">
      <div className="loading-container">
        <img
          src={logo}
          alt="Portfolio Tracker Logo"
          className="loading-logo pulse"
          width="60"
          height="50"
        />
        <div className="spinner">
          <div className="spinner-inner"></div>
        </div>
        <p className="loading-message">{message}</p>
      </div>
    </div>
  );
};

export default LoadingScreen;
