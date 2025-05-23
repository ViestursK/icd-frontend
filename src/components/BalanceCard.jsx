import React from "react";
import PropTypes from "prop-types";
import "./BalanceCard.css";
import "./skeleton.css";
import PremiumBackground from "./ui/PremiumBackground";

export default function BalanceCard({ balance, changePercent, isLoading }) {
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

  return (
    <div className="balance-card" aria-busy={isLoading}>
      <div className="balance-card-content">
      {/* <PremiumBackground /> */}
        <div className="balance-info">
          <div className="balance-header">
            <span className="balance-label">Total Balance</span>
          </div>

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
