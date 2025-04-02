import React, { Component } from "react";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    // Log the error to an error reporting service
    console.error("Error caught by boundary:", error, errorInfo);
    this.setState({ errorInfo });

    // You could also log to an error tracking service like Sentry here
  }

  handleRetry = () => {
    // Clear the error state and retry rendering
    this.setState({ hasError: false, error: null, errorInfo: null });
  };

  render() {
    if (this.state.hasError) {
      // Fallback UI when an error occurs
      return (
        <div className="error-boundary">
          <div className="error-container">
            <h1>Something went wrong</h1>
            <p>We're sorry, but an unexpected error occurred.</p>

            {/* Only show error details in development mode */}
            {import.meta.env.DEV && this.state.error && (
              <div className="error-details">
                <h3>Error details:</h3>
                <p>{this.state.error.toString()}</p>
                {this.state.errorInfo && (
                  <details>
                    <summary>Component stack trace</summary>
                    <pre>{this.state.errorInfo.componentStack}</pre>
                  </details>
                )}
              </div>
            )}

            <div className="error-actions">
              <button onClick={this.handleRetry}>Try Again</button>
              <button onClick={() => (window.location.href = "/")}>
                Go to Home
              </button>
            </div>
          </div>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
