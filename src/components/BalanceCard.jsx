import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import { FaBolt, FaPowerOff } from "react-icons/fa";
import binanceService, { BINANCE_EVENTS } from "../services/binanceService";
import "./BalanceCard.css";
import "./skeleton.css";
import "./LivePriceUpdate.css";

export default function BalanceCard({ balance, changePercent, isLoading }) {
  // State for live mode
  const [liveMode, setLiveMode] = useState(false);
  // State for animation
  const [priceUpdated, setPriceUpdated] = useState(false);
  // Connection state
  const [isConnected, setIsConnected] = useState(false);

  // Define color scheme for percentage changes
  const colors = { red: "#FF1C1C", green: "#3EDD87", white: "#F2F2FA" };

  // Toggle live price updates
  const toggleLiveMode = () => {
    const newLiveMode = !liveMode;
    setLiveMode(newLiveMode);
    binanceService.setLiveMode(newLiveMode);
  };

  // Subscribe to Binance WebSocket events
  useEffect(() => {
    // Initial state check
    setLiveMode(binanceService.isLiveModeEnabled());

    // Subscribe to price updates to animate the balance card
    const priceUnsubscribe = binanceService.subscribe(
      BINANCE_EVENTS.PRICE_UPDATE,
      (data) => {
        // Trigger animation for price update
        setPriceUpdated(true);

        // Reset animation after a delay
        setTimeout(() => {
          setPriceUpdated(false);
        }, 2000);
      }
    );

    // Subscribe to connection state changes
    const connectionUnsubscribe = binanceService.subscribe(
      BINANCE_EVENTS.CONNECTION_STATE,
      (state) => {
        setIsConnected(state.connected);
        setLiveMode(state.liveMode);
      }
    );

    // Clean up subscriptions when component unmounts
    return () => {
      priceUnsubscribe();
      connectionUnsubscribe();
    };
  }, []);

  // Determine the color based on percentage change
  const getChangeColor = () => {
    if (!changePercent) return colors.white;

    const numericChange = parseFloat(changePercent);
    if (numericChange < 0) return colors.red;
    if (numericChange > 0) return colors.green;
    return colors.white;
  };

  // Format the balance with proper commas and decimals
  const formatBalance = (balance) => {
    return Number(balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format the percent change with + prefix for positive values
  const formatChangePercent = (percent) => {
    if (!percent) return "0.00%";

    const numericChange = parseFloat(percent);
    const sign = numericChange > 0 ? "+" : "";
    return `${sign}${numericChange.toFixed(2)}%`;
  };

  return (
    <div
      className={`balance-card ${priceUpdated ? "price-updated" : ""}`}
      aria-busy={isLoading}
    >
      <div className="balance-card-content">
        <div className="balance-info">
          <div className="balance-header">
            <span className="balance-label">Total Balance</span>
            <button
              className={`live-toggle ${liveMode ? "active" : ""}`}
              onClick={toggleLiveMode}
              title={liveMode ? "Disable live updates" : "Enable live updates"}
              aria-pressed={liveMode}
            >
              {liveMode ? (
                <FaBolt
                  className={`live-icon ${isConnected ? "connected" : ""}`}
                />
              ) : (
                <FaPowerOff className="live-icon" />
              )}
              <span className="sr-only">
                {liveMode ? "Disable live updates" : "Enable live updates"}
              </span>
            </button>
          </div>

          {isLoading ? (
            <div className="skeleton-wrapper">
              <div className="skeleton skeleton-text large"></div>
            </div>
          ) : (
            <div className="balance-amount">
              <span className="currency-symbol">$</span>
              <span className="balance-value">{formatBalance(balance)}</span>
              {liveMode && isConnected && (
                <span className="live-badge">LIVE</span>
              )}
            </div>
          )}

          <div className="balance-change">
            {isLoading ? (
              <div className="skeleton skeleton-text small"></div>
            ) : (
              <>
                <span className="change-label">Last 24 hours</span>
                <span
                  className="change-value"
                  style={{ color: getChangeColor() }}
                  aria-label={`${formatChangePercent(
                    changePercent
                  )} change in the last 24 hours`}
                >
                  {formatChangePercent(changePercent)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="balance-chart">
          {isLoading ? (
            <div className="skeleton skeleton-chart"></div>
          ) : (
            <img
              src="/assets/Chart.svg"
              className="chart-svg"
              alt=""
              aria-hidden="true"
            />
          )}
        </div>
      </div>
    </div>
  );
}

BalanceCard.propTypes = {
  balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  changePercent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isLoading: PropTypes.bool,
};

BalanceCard.defaultProps = {
  balance: "0.00",
  changePercent: "0.00",
  isLoading: false,
};
