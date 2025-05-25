// BalanceCard.jsx - Simple shimmer when loading
import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { FaArrowUp, FaArrowDown } from "react-icons/fa";
import "./BalanceCard.css";
import BalanceChart from "./BalanceChart";

const BalanceCard = ({ balance, changePercent, isLoading }) => {
  // Format balance with proper thousands separators and 2 decimal places
  const formatBalance = (balance) => {
    if (balance === null || balance === undefined || isNaN(balance)) {
      return "0.00";
    }

    // Parse as float and use standard number formatting with exactly 2 decimal places
    const num = parseFloat(balance);
    return num.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format change percent with sign
  const formatChangePercent = (percent) => {
    if (!percent) return "0.00%";
    const numericChange = parseFloat(percent);
    const sign = numericChange > 0 ? "+" : "";
    return `${sign}${numericChange.toFixed(2)}%`;
  };

  // Get icon for the change direction
  const getChangeIcon = () => {
    const numericChange = parseFloat(changePercent);
    if (numericChange > 0) return <FaArrowUp />;
    if (numericChange < 0) return <FaArrowDown />;
    return null;
  };

  // Get color for the change value
  const getChangeColor = () => {
    if (!changePercent) return "#F2F2FA";
    const numericChange = parseFloat(changePercent);
    if (numericChange < 0) return "#FF4C4C";
    if (numericChange > 0) return "#32C376";
    return "#F2F2FA";
  };

  // Get dynamic font size class based on balance length
  const balanceFontClass = useMemo(() => {
    const formattedBalance = formatBalance(balance);

    if (formattedBalance.length > 14) {
      return "balance-value-small";
    } else if (formattedBalance.length > 10) {
      return "balance-value-medium";
    } else {
      return "balance-value-large";
    }
  }, [balance]);

  // Show shimmer effect when loading
  if (isLoading) {
    return <div className="balance-card shimmer-loading"></div>;
  }

  return (
    <div className="balance-card" aria-busy={isLoading}>
      <div className="balance-card-content">
        <div className="balance-info-container">
          <div className="balance-info">
            <span className="balance-label">TOTAL BALANCE</span>
            <div className="balance-amount">
              <span className="currency-symbol">$</span>
              <span
                className={`balance-value ${balanceFontClass}`}
                title={`${formatBalance(balance)}`}
              >
                {formatBalance(balance)}
              </span>
            </div>

            <div className="balance-change">
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
            </div>
          </div>
        </div>

        <div className="chart-container">
          <BalanceChart
            balance={balance}
            changePercent={changePercent}
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
