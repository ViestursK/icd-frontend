// BalanceCard.jsx - Fixed version with consistent font sizing
import { useEffect, useState, useMemo } from "react";
import PropTypes from "prop-types";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import "./BalanceCard.css";
import BalanceChart from "./BalanceChart";

const BalanceCard = ({ balance, changePercent, isLoading }) => {
  // Format balance with proper thousands separators and 2 decimal places
  const formatBalance = (balance) => {
    if (balance === null || balance === undefined || balance === "") {
      return "0.00";
    }

    // Convert to number and handle edge cases
    const num = parseFloat(balance);
    if (isNaN(num)) {
      return "0.00";
    }

    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format change percent with sign
  const formatChangePercent = (percent) => {
    if (percent === null || percent === undefined || percent === "") {
      return "0.00%";
    }

    const numericChange = parseFloat(percent);
    if (isNaN(numericChange)) {
      return "0.00%";
    }

    const sign = numericChange > 0 ? "+" : "";
    return `${sign}${numericChange.toFixed(2)}%`;
  };

  // Get icon for the change direction
  const getChangeIcon = () => {
    const numericChange = parseFloat(changePercent || 0);
    if (numericChange > 0) return <FaArrowUp />;
    if (numericChange < 0) return <FaArrowDown />;
    return null;
  };

  // Get color for the change value
  const getChangeColor = () => {
    const numericChange = parseFloat(changePercent || 0);
    if (numericChange < 0) return "var(--color-error)";
    if (numericChange > 0) return "var(--color-success)";
    return "var(--color-text-secondary)";
  };

  // Show shimmer effect when loading
  if (isLoading) {
    return (
      <div className="balance-card">
        <div className="balance-card-shimmer"></div>
      </div>
    );
  }

  // Ensure we always have valid values
  const safeBalance = balance || "0.00";
  const safeChangePercent = changePercent || "0.00";
  const formattedBalance = formatBalance(safeBalance);

  return (
    <div className="balance-card" aria-busy={isLoading}>
      <div className="balance-card-content">
        <div className="balance-info-container">
          <div className="balance-info">
            <span className="balance-label">TOTAL BALANCE</span>
            <div className="balance-amount">
              <span className="currency-symbol">$ {`${formattedBalance}`}</span>
            </div>

            <div className="balance-change">
              <span className="change-label">24h</span>
              <span
                className="change-value"
                style={{ color: getChangeColor() }}
                aria-label={`${formatChangePercent(
                  safeChangePercent
                )} change in the last 24 hours`}
              >
                {getChangeIcon()}
                {formatChangePercent(safeChangePercent)}
              </span>
            </div>
          </div>
        </div>

        <div className="chart-container">
          <BalanceChart
            changePercent={safeChangePercent}
            className="balance-chart-svg"
          />
        </div>
      </div>
    </div>
  );
};

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

export default BalanceCard;
