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
import BalanceChart from "./BalanceChart";
import "./BalanceCard.css";
import "./skeleton.css";

export default function BalanceCard({
  balance,
  changePercent,
  isLoading,
  stats,
}) {
  // Define color scheme for percentage changes
  const colors = { red: "#FF1C1C", green: "#3EDD87", white: "#F2F2FA" };

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

  // Get icon for change direction
  const getChangeIcon = () => {
    const numericChange = parseFloat(changePercent);
    if (numericChange > 0) return <FaArrowUp />;
    if (numericChange < 0) return <FaArrowDown />;
    return null;
  };

  // Format number for stat badges with appropriate precision
  const formatStatValue = (value, isCount = false) => {
    if (isCount) return value; // For counts, just return the number

    // For currency values
    if (typeof value === "string" || typeof value === "number") {
      const numValue = parseFloat(value);
      if (numValue > 999) return `${(numValue / 1000).toFixed(1)}k`;
      return numValue.toFixed(0);
    }

    return "0";
  };

  return (
    <div className="balance-card" aria-busy={isLoading}>
      <div className="balance-card-content">
        <div className="balance-info">
          <span className="balance-label">Total Balance</span>
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
        </div>

        <div className="balance-header">
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

        {/* Improved square stat badges on the top right corner */}
        {!isLoading && stats && (
          <div className="stat-badges-container">
            {/* Wallets count badge */}
            {stats.walletCount !== undefined && (
              <div
                className="stat-badge blue"
                title="Total number of tracked wallets"
              >
                <FaWallet className="stat-badge-icon" />
                <span className="stat-badge-value">
                  {formatStatValue(stats.walletCount, true)}
                </span>
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
                <span className="stat-badge-value">
                  {formatStatValue(stats.assetCount, true)}
                </span>
                <span className="stat-badge-label">Assets</span>
              </div>
            )}

            {/* Top asset badge */}
            {stats.topAsset && stats.topAsset.symbol !== "N/A" && (
              <div
                className="stat-badge gold"
                title={`Top Asset: ${stats.topAsset.symbol} - ${parseFloat(
                  stats.topAsset.value
                ).toLocaleString()}`}
              >
                <FaStar className="stat-badge-icon" />
                <span className="stat-badge-value">
                  {stats.topAsset.symbol}
                </span>
                <span className="stat-badge-label">Top Asset</span>
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
                  <span className="stat-badge-label">Biggest Move</span>
                </div>
              )}
          </div>
        )}
      </div>
    </div>
  );
}

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
