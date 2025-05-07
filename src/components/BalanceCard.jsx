import React from "react";
import PropTypes from "prop-types";
import {
  FaArrowUp,
  FaArrowDown,
  FaWallet,
  FaCoins,
  FaStar,
  FaChartLine,
} from "react-icons/fa";
import "./BalanceCard.css"; // We'll continue using the existing CSS file

const BalanceCard = ({ balance, changePercent, isLoading, stats }) => {
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

  // Get icon for change direction
  const getChangeIcon = () => {
    const numericChange = parseFloat(changePercent);
    if (numericChange > 0) return <FaArrowUp />;
    if (numericChange < 0) return <FaArrowDown />;
    return null;
  };

  // Get color based on percentage change
  const getChangeColor = () => {
    if (!changePercent) return "#F2F2FA"; // White

    const numericChange = parseFloat(changePercent);
    if (numericChange < 0) return "#FF4C4C"; // Red
    if (numericChange > 0) return "#32C376"; // Green
    return "#F2F2FA"; // White
  };

  return (
    <div className="balance-card" aria-busy={isLoading}>
      <div className="balance-card-content">
        {/* Stat badges in top right corner */}
        {!isLoading && stats && (
          <div className="stat-badges-container">
            {/* Wallets count badge */}
            {stats.walletCount !== undefined && (
              <div
                className="stat-badge blue"
                title="Total number of tracked wallets"
              >
                <FaWallet className="stat-badge-icon" />
                <span className="stat-badge-value">{stats.walletCount}</span>
                <span className="stat-badge-label">Wallets</span>
              </div>
            )}

            {/* Assets count badge */}
            {stats.assetCount !== undefined && (
              <div
                className="stat-badge purple"
                title="Total number of crypto assets"
              >
                <FaCoins className="stat-badge-icon" />
                <span className="stat-badge-value">{stats.assetCount}</span>
                <span className="stat-badge-label">Assets</span>
              </div>
            )}

            {/* Top asset badge */}
            {stats.topAsset && stats.topAsset.symbol !== "N/A" && (
              <div
                className="stat-badge gold"
                title={`Top Asset: ${stats.topAsset.symbol} - $${parseFloat(
                  stats.topAsset.value
                ).toLocaleString()}`}
              >
                <FaStar className="stat-badge-icon" />
                <span className="stat-badge-value">
                  {stats.topAsset.symbol}
                </span>
                <span className="stat-badge-label">Top</span>
              </div>
            )}

            {/* Biggest impact badge */}
            {stats.biggestImpact &&
              stats.biggestImpact.symbol !== "N/A" &&
              parseFloat(stats.biggestImpact.change) !== 0 && (
                <div
                  className={`stat-badge ${
                    parseFloat(stats.biggestImpact.change) > 0 ? "green" : "red"
                  }`}
                  title={`Biggest 24h Impact: ${stats.biggestImpact.symbol} - ${
                    parseFloat(stats.biggestImpact.change) > 0 ? "+" : ""
                  }${parseFloat(stats.biggestImpact.change).toFixed(2)}%`}
                >
                  <FaChartLine className="stat-badge-icon" />
                  <span className="stat-badge-value">
                    {stats.biggestImpact.symbol}
                  </span>
                  <span className="stat-badge-label">Impact</span>
                </div>
              )}
          </div>
        )}

        <div className="balance-info">
          <span className="balance-label">TOTAL BALANCE</span>
          {isLoading ? (
            <div className="skeleton-wrapper">
              <div className="skeleton skeleton-text large"></div>
            </div>
          ) : (
            <div className="balance-amount">
              <span className="currency-symbol">$</span>
              <span className="balance-value">{formatBalance(balance)}</span>
            </div>
          )}

          <div className="balance-change">
            {isLoading ? (
              <div className="skeleton skeleton-text small"></div>
            ) : (
              <>
                <span className="change-label">24h</span>
                <span
                  className="change-value"
                  style={{ color: getChangeColor() }}
                  aria-label={`${formatChangePercent(
                    changePercent
                  )} change in the last 24 hours`}
                >
                  {getChangeIcon()}
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
            <BalanceChart balance={balance} changePercent={changePercent} />
          )}
        </div>
      </div>
    </div>
  );
};

// Chart component
const BalanceChart = ({ balance, changePercent }) => {
  // Determine colors based on change percent (positive/negative)
  const isPositive = parseFloat(changePercent) >= 0;
  const strokeColor = isPositive ? "#32c376" : "#ff4c4c";
  const gradientStart = isPositive
    ? "rgba(50, 195, 118, 0.2)"
    : "rgba(255, 76, 76, 0.2)";
  const gradientEnd = "rgba(28, 24, 51, 0)";

  // Generate chart path based on change percentage
  const generateChartPath = () => {
    // Create a more realistic chart path based on change percentage
    const changeValue = parseFloat(changePercent) || 0;
    const direction = changeValue >= 0 ? 1 : -1;
    const trendFactor = Math.min(Math.abs(changeValue) * 0.3, 10); // Scale factor based on change

    // Starting point
    let startY = 30;

    // Generate points for a smooth curve
    // More points = smoother curve
    let linePath = `M0,${startY}`;
    let areaPath = `M0,50 L0,${startY}`;

    // Add intermediate points
    for (let i = 1; i < 10; i++) {
      const x = i * 10;
      const progress = i / 10;

      // Add some randomness for realistic chart
      const randomness = Math.sin(i * 0.5) * 3;

      // Calculate y position with trend direction
      const y = startY - progress * direction * trendFactor - randomness;

      // Ensure y is in bounds
      const clampedY = Math.min(Math.max(y, 5), 45);

      linePath += ` C${x - 5},${startY} ${x - 5},${clampedY} ${x},${clampedY}`;
      areaPath += ` L${x},${clampedY}`;

      // Update startY for next segment
      startY = clampedY;
    }

    // Final point
    linePath += ` L100,${startY - direction * trendFactor * 0.5}`;
    areaPath += ` L100,${startY - direction * trendFactor * 0.5} L100,50 Z`;

    return { linePath, areaPath };
  };

  const paths = generateChartPath();

  return (
    <svg
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "15rem", display: "flex" }}
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientStart} stopOpacity="0.8" />
          <stop offset="100%" stopColor={gradientEnd} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Grid lines for better visibility */}
      <line
        x1="0"
        y1="25"
        x2="100"
        y2="25"
        stroke="rgba(255,255,255,0.03)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="38"
        x2="100"
        y2="38"
        stroke="rgba(255,255,255,0.02)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="12"
        x2="100"
        y2="12"
        stroke="rgba(255,255,255,0.02)"
        strokeWidth="0.5"
      />

      {/* Area fill under the curve */}
      <path d={paths.areaPath} fill="url(#chartGradient)" stroke="none" />

      {/* The line chart itself */}
      <path
        d={paths.linePath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

BalanceCard.propTypes = {
  balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  changePercent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  isLoading: PropTypes.bool,
  stats: PropTypes.shape({
    walletCount: PropTypes.number,
    assetCount: PropTypes.number,
    topAsset: PropTypes.shape({
      symbol: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
    biggestImpact: PropTypes.shape({
      symbol: PropTypes.string,
      value: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
      change: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    }),
  }),
};

BalanceCard.defaultProps = {
  balance: "0.00",
  changePercent: "0.00",
  isLoading: false,
  stats: null,
};

export default BalanceCard;
