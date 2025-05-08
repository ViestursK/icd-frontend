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
import "./BalanceCard.css";
import BalanceChart from "./BalanceChart"; // Updated import

const BalanceCard = ({ balance, changePercent, isLoading, stats }) => {
  const formatBalance = (balance) =>
    Number(balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const formatChangePercent = (percent) => {
    if (!percent) return "0.00%";
    const numericChange = parseFloat(percent);
    const sign = numericChange > 0 ? "+" : "";
    return `${sign}${numericChange.toFixed(2)}%`;
  };

  const getChangeIcon = () => {
    const numericChange = parseFloat(changePercent);
    if (numericChange > 0) return <FaArrowUp />;
    if (numericChange < 0) return <FaArrowDown />;
    return null;
  };

  const getChangeColor = () => {
    if (!changePercent) return "#F2F2FA";
    const numericChange = parseFloat(changePercent);
    if (numericChange < 0) return "#FF4C4C";
    if (numericChange > 0) return "#32C376";
    return "#F2F2FA";
  };

  return (
    <div className="balance-card" aria-busy={isLoading}>
      <div className="balance-card-content">
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
            <BalanceChart
              balance={balance}
              changePercent={changePercent}
              className="balance-chart-svg"
            />
          )}
        </div>
      </div>
    </div>
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
