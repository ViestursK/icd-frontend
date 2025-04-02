import React, { useState, useEffect } from "react";
import {
  FaTimes,
  FaExclamationCircle,
  FaCheckCircle,
  FaInfoCircle,
} from "react-icons/fa";
import "./Toast.css";

const Toast = ({
  message,
  type = "info",
  duration = 5000,
  onClose,
  position = "bottom-right",
}) => {
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    if (duration) {
      const timer = setTimeout(() => {
        handleClose();
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [duration]);

  const handleClose = () => {
    setIsVisible(false);

    // Give time for exit animation to complete
    setTimeout(() => {
      if (onClose) onClose();
    }, 300);
  };

  // Icon based on toast type
  const getIcon = () => {
    switch (type) {
      case "error":
        return <FaExclamationCircle className="toast-icon error" />;
      case "success":
        return <FaCheckCircle className="toast-icon success" />;
      case "info":
      default:
        return <FaInfoCircle className="toast-icon info" />;
    }
  };

  return (
    <div
      className={`toast ${type} ${position} ${isVisible ? "show" : "hide"}`}
      role="alert"
      aria-live="assertive"
    >
      <div className="toast-content">
        {getIcon()}
        <span className="toast-message">{message}</span>
        <button
          className="toast-close"
          onClick={handleClose}
          aria-label="Close notification"
        >
          <FaTimes />
        </button>
      </div>
    </div>
  );
};

export default Toast;
