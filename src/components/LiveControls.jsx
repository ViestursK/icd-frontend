import React, { useState, useEffect } from "react";
import { FaBolt, FaPowerOff, FaWifi, FaTimes } from "react-icons/fa";
import binanceService, { BINANCE_EVENTS } from "../services/binanceService";
import { useToast } from "../context/ToastContext";
import "./LiveControls.css";

const LiveControls = () => {
  const [liveMode, setLiveMode] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [showTooltip, setShowTooltip] = useState(false);
  const toast = useToast();

  // Subscribe to binance connection state changes
  useEffect(() => {
    // Get initial state
    setLiveMode(binanceService.isLiveModeEnabled());

    // Subscribe to connection state changes
    const unsubscribe = binanceService.subscribe(
      BINANCE_EVENTS.CONNECTION_STATE,
      (state) => {
        setIsConnected(state.connected);
        setLiveMode(state.liveMode);

        // Show connection state changes as toasts
        if (state.liveMode && state.connected && !state.error) {
          toast.info("Live price updates connected");
        } else if (state.liveMode && !state.connected && state.error) {
          toast.error("Live price updates connection error");
        }
      }
    );

    // Cleanup on unmount
    return () => {
      unsubscribe();
    };
  }, [toast]);

  // Toggle live mode
  const toggleLiveMode = () => {
    const newState = !liveMode;
    binanceService.setLiveMode(newState);
    setLiveMode(newState);

    if (newState) {
      toast.info("Live price updates enabled");
    } else {
      toast.info("Live price updates disabled");
    }
  };

  // Show tooltip with info about live mode
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  const handleMouseLeave = () => {
    setShowTooltip(false);
  };

  return (
    <div className="live-controls">
      <button
        className={`live-toggle-button ${liveMode ? "active" : ""}`}
        onClick={toggleLiveMode}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        aria-label={liveMode ? "Disable live updates" : "Enable live updates"}
        title={liveMode ? "Disable live updates" : "Enable live updates"}
      >
        {liveMode ? (
          <>
            <FaBolt className={`live-icon ${isConnected ? "connected" : ""}`} />
            <span className="live-label">LIVE</span>
            {isConnected && <FaWifi className="connection-icon" />}
          </>
        ) : (
          <>
            <FaPowerOff className="live-icon" />
            <span className="live-label">STATIC</span>
          </>
        )}
      </button>

      {showTooltip && (
        <div className="live-tooltip">
          <div className="tooltip-header">
            <span className="tooltip-title">
              {liveMode ? "Live Updates Enabled" : "Live Updates Disabled"}
            </span>
            <button
              className="tooltip-close"
              onClick={() => setShowTooltip(false)}
              aria-label="Close tooltip"
            >
              <FaTimes />
            </button>
          </div>
          <div className="tooltip-content">
            {liveMode ? (
              <p>
                Prices are being updated in real-time from Binance.
                {isConnected
                  ? " Connection is active."
                  : " Attempting to connect..."}
              </p>
            ) : (
              <p>
                Enable live updates to see real-time price changes. Click the
                button to enable.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LiveControls;
