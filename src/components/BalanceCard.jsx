// BalanceCard.jsx - Fixed version that always calculates font size correctly
import React, { useEffect, useState } from "react";
import PropTypes from "prop-types";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import "./BalanceCard.css";
import BalanceChart from "./BalanceChart";

const BalanceCard = ({ balance, changePercent, isLoading }) => {
  // State to force re-render when balance changes
  const [currentBalance, setCurrentBalance] = useState(balance);
  const [fontClass, setFontClass] = useState("balance-value-large");

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

  // Calculate font size class based on formatted balance length
  const calculateFontClass = (balance) => {
    const formattedBalance = formatBalance(balance);
    const balanceLength = formattedBalance.length;

    if (balanceLength > 14) {
      return "balance-value-small";
    } else if (balanceLength > 10) {
      return "balance-value-medium";
    } else {
      return "balance-value-large";
    }
  };

  // Update font class whenever balance changes
  useEffect(() => {
    if (balance !== currentBalance) {
      const newFontClass = calculateFontClass(balance);
      console.log("BalanceCard balance changed:", {
        oldBalance: currentBalance,
        newBalance: balance,
        formattedBalance: formatBalance(balance),
        newFontClass,
        timestamp: new Date().toISOString(),
      });

      setCurrentBalance(balance);
      setFontClass(newFontClass);
    }
  }, [balance, currentBalance]);

  // Also calculate on initial render
  useEffect(() => {
    const initialFontClass = calculateFontClass(balance);
    setFontClass(initialFontClass);
    console.log("BalanceCard initial render:", {
      balance,
      formattedBalance: formatBalance(balance),
      fontClass: initialFontClass,
    });
  }, []); // Only run once on mount

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
    if (numericChange < 0) return "#FF4C4C";
    if (numericChange > 0) return "#32C376";
    return "#F2F2FA";
  };

  // Show shimmer effect when loading
  if (isLoading) {
    return (
      <div className="balance-card">
        <div className="balance-card-shimmer shimmer-loading">
          <div className="shimmer-content">
            <div className="shimmer-line balance-label-shimmer"></div>
            <div className="shimmer-line balance-value-shimmer"></div>
            <div className="shimmer-line balance-change-shimmer"></div>
          </div>
        </div>
      </div>
    );
  }

  // Ensure we always have valid values
  const safeBalance = balance || "0.00";
  const safeChangePercent = changePercent || "0.00";

  return (
    <div className="balance-card" aria-busy={isLoading}>
      <div className="balance-card-content">
        <div className="balance-info-container">
          <div className="balance-info">
            <span className="balance-label">TOTAL BALANCE</span>
            <div className="balance-amount">
              <span className="currency-symbol">$</span>
              <span
                className={`balance-value ${fontClass}`}
                title={`$${formatBalance(safeBalance)}`}
                data-balance={safeBalance}
                data-font-class={fontClass}
              >
                {formatBalance(safeBalance)}
              </span>
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
            balance={safeBalance}
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
