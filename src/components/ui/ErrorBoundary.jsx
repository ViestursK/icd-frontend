// src/components/ui/ErrorBoundary.jsx - IMPROVED VERSION

import React, { Component } from "react";
import tokenService from "../../services/tokenService";

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };
  }

  static getDerivedStateFromError(error) {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: Date.now().toString(36) + Math.random().toString(36).substr(2),
    };
  }

  componentDidCatch(error, errorInfo) {
    // Enhanced error logging with more context
    const errorDetails = {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      timestamp: new Date().toISOString(),
      url: window.location.href,
      userAgent: navigator.userAgent,
      // Auth context
      hasAccessToken: !!tokenService.getAccessToken(),
      hasRefreshToken: !!tokenService.getRefreshToken(),
      tokenValid: tokenService.getAccessToken()
        ? tokenService.isTokenValid(tokenService.getAccessToken())
        : false,
    };

    console.group("🚨 Error Boundary Caught Error");
    console.error("Error:", error);
    console.error("Error Info:", errorInfo);
    console.error("Additional Context:", errorDetails);
    console.groupEnd();

    this.setState({ errorInfo });

    // Check if this might be an auth-related error
    if (this.isAuthRelatedError(error)) {
      console.warn("Detected potential auth-related error, clearing tokens");
      tokenService.clearTokens();
    }

    // You could also log to an error tracking service like Sentry here
    // Sentry.captureException(error, { extra: errorDetails });
  }

  isAuthRelatedError = (error) => {
    const errorString = error.toString().toLowerCase();
    const authKeywords = [
      "token",
      "authentication",
      "unauthorized",
      "jwt",
      "refresh",
      "login",
      "auth",
    ];

    return authKeywords.some((keyword) => errorString.includes(keyword));
  };

  handleRetry = () => {
    // Clear the error state and retry rendering
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  handleClearTokensAndRetry = () => {
    // Clear tokens and retry
    tokenService.clearTokens();
    localStorage.clear(); // Clear all local storage as nuclear option
    this.handleRetry();
  };

  handleGoHome = () => {
    // Clear error state and navigate to home
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
    window.location.href = "/";
  };

  render() {
    if (this.state.hasError) {
      const isAuthError = this.isAuthRelatedError(this.state.error);

      // Fallback UI when an error occurs
      return (
        <div className="error-boundary">
          <div className="error-container">
            <div className="error-icon">
              <svg
                width="64"
                height="64"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="#f87171"
                  strokeWidth="2"
                />
                <line
                  x1="15"
                  y1="9"
                  x2="9"
                  y2="15"
                  stroke="#f87171"
                  strokeWidth="2"
                />
                <line
                  x1="9"
                  y1="9"
                  x2="15"
                  y2="15"
                  stroke="#f87171"
                  strokeWidth="2"
                />
              </svg>
            </div>

            <h1>Something went wrong</h1>

            {isAuthError ? (
              <div className="error-message">
                <p>
                  We detected an authentication issue. This might be due to
                  expired session tokens.
                </p>
                <p>Try clearing your session data and logging in again.</p>
              </div>
            ) : (
              <p>We're sorry, but an unexpected error occurred.</p>
            )}

            {/* Only show error details in development mode */}
            {import.meta.env.DEV && this.state.error && (
              <div className="error-details">
                <details>
                  <summary>Error details (development only)</summary>
                  <div className="error-content">
                    <h3>Error:</h3>
                    <pre>{this.state.error.toString()}</pre>

                    {this.state.errorInfo && (
                      <>
                        <h3>Component stack trace:</h3>
                        <pre>{this.state.errorInfo.componentStack}</pre>
                      </>
                    )}

                    <h3>Debug Info:</h3>
                    <pre>
                      {JSON.stringify(
                        {
                          hasAccessToken: !!tokenService.getAccessToken(),
                          hasRefreshToken: !!tokenService.getRefreshToken(),
                          tokenValid: tokenService.getAccessToken()
                            ? tokenService.isTokenValid(
                                tokenService.getAccessToken()
                              )
                            : false,
                          timestamp: new Date().toISOString(),
                          errorId: this.state.errorId,
                        },
                        null,
                        2
                      )}
                    </pre>
                  </div>
                </details>
              </div>
            )}

            <div className="error-actions">
              <button onClick={this.handleRetry} className="retry-button">
                Try Again
              </button>

              {isAuthError && (
                <button
                  onClick={this.handleClearTokensAndRetry}
                  className="clear-session-button"
                >
                  Clear Session & Retry
                </button>
              )}

              <button onClick={this.handleGoHome} className="home-button">
                Go to Home
              </button>
            </div>
          </div>

          <style jsx>{`
            .error-boundary {
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              padding: 2rem;
              background-color: var(--color-background);
              color: var(--color-text);
            }

            .error-container {
              max-width: 600px;
              text-align: center;
              background: var(--color-card-background);
              padding: 3rem;
              border-radius: 1rem;
              border: 1px solid var(--color-border);
              box-shadow: 0 10px 25px var(--color-shadow);
            }

            .error-icon {
              margin-bottom: 2rem;
              display: flex;
              justify-content: center;
            }

            .error-container h1 {
              font-size: 2rem;
              margin-bottom: 1rem;
              color: var(--color-text);
            }

            .error-message {
              margin-bottom: 2rem;
            }

            .error-message p {
              margin-bottom: 0.5rem;
              color: var(--color-text-secondary);
            }

            .error-details {
              margin: 2rem 0;
              text-align: left;
              background: var(--color-hover-overlay);
              border-radius: 0.5rem;
              padding: 1rem;
            }

            .error-details summary {
              cursor: pointer;
              font-weight: 600;
              margin-bottom: 1rem;
              color: var(--color-text);
            }

            .error-content h3 {
              margin-top: 1.5rem;
              margin-bottom: 0.5rem;
              color: var(--color-text);
            }

            .error-content pre {
              background: var(--color-background);
              padding: 1rem;
              border-radius: 0.25rem;
              font-size: 0.75rem;
              overflow-x: auto;
              white-space: pre-wrap;
              color: var(--color-text);
              border: 1px solid var(--color-border);
            }

            .error-actions {
              display: flex;
              gap: 1rem;
              justify-content: center;
              flex-wrap: wrap;
            }

            .error-actions button {
              padding: 0.75rem 1.5rem;
              border-radius: 0.5rem;
              font-weight: 600;
              cursor: pointer;
              transition: all 0.2s ease;
              border: none;
              font-size: 0.875rem;
            }

            .retry-button {
              background: var(--color-primary);
              color: white;
            }

            .retry-button:hover {
              background: var(--color-primary-dark);
            }

            .clear-session-button {
              background: var(--color-warning);
              color: white;
            }

            .clear-session-button:hover {
              opacity: 0.9;
            }

            .home-button {
              background: var(--color-hover-overlay);
              color: var(--color-text);
              border: 1px solid var(--color-border);
            }

            .home-button:hover {
              background: var(--color-active-overlay);
            }

            @media (max-width: 640px) {
              .error-container {
                padding: 2rem;
                margin: 1rem;
              }

              .error-actions {
                flex-direction: column;
              }

              .error-actions button {
                width: 100%;
              }
            }
          `}</style>
        </div>
      );
    }

    // If no error, render children normally
    return this.props.children;
  }
}

export default ErrorBoundary;
