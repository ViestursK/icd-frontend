import React, { createContext, useContext, useState, useCallback } from "react";
import Toast from "../components/ui/Toast";

// Create context
const ToastContext = createContext(null);

// Generate unique ID for each toast
const generateId = () =>
  `toast-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

// Toast provider component
export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  // Add a toast
  const addToast = useCallback(
    ({
      message,
      type = "info",
      duration = 5000,
      position = "bottom-right",
    }) => {
      const id = generateId();

      setToasts((prev) => [
        ...prev,
        {
          id,
          message,
          type,
          duration,
          position,
        },
      ]);

      return id;
    },
    []
  );

  // Remove a toast by ID
  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  // Shorthand methods for different toast types
  const success = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: "success", ...options });
    },
    [addToast]
  );

  const error = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: "error", ...options });
    },
    [addToast]
  );

  const info = useCallback(
    (message, options = {}) => {
      return addToast({ message, type: "info", ...options });
    },
    [addToast]
  );

  // Context value
  const contextValue = {
    addToast,
    removeToast,
    success,
    error,
    info,
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}

      {/* Render all active toasts */}
      {toasts.map((toast) => (
        <Toast
          key={toast.id}
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          position={toast.position}
          onClose={() => removeToast(toast.id)}
        />
      ))}
    </ToastContext.Provider>
  );
};

// Hook to use toast context
export const useToast = () => {
  const context = useContext(ToastContext);

  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }

  return context;
};

export default ToastContext;
