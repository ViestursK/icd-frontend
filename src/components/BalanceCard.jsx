import React from "react";
import PropTypes from "prop-types";
import { FaArrowUp, FaArrowDown, FaWallet, FaCoins, FaStar, FaChartLine } from "react-icons/fa";
import "./BalanceCard.css";

const BalanceChart = ({ balance, changePercent }) => {
  // Determine colors based on change percent (positive/negative)
  const isPositive = parseFloat(changePercent) >= 0;
  const strokeColor = isPositive ? "#32c376" : "#ff4c4c";
  const gradientStart = isPositive ? "rgba(50, 195, 118, 0.2)" : "rgba(255, 76, 76, 0.2)";
  const gradientEnd = "rgba(28, 24, 51, 0)";

  return (
    <svg
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block" }}
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

      {/* Example chart path - in a real implementation this would be dynamic */}
      <path
        d="M0,30 C10,28 20,32 30,26 C40,20 50,25 60,23 C70,21 80,18 90,15 L100,12"
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Area fill under the curve */}
      <path
        d="M0,30 C10,28 20,32 30,26 C40,20 50,25 60,23 C70,21 80,18 90,15 L100,12 L100,50 L0,50 Z"
        fill="url(#chartGradient)"
        stroke="none"
      />
    </svg>
  );
};

export default function BalanceCard({ balance, changePercent, isLoading, stats }) {
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
    <div className="compact-balance-card" aria-busy={isLoading}>
      <div className="balance-card-content">
        {/* Stat badges in top right corner */}
        {!isLoading && stats && (
          <div className="compact-stat-badges">
            {/* Wallets count badge */}
            {stats.walletCount !== undefined && (
              <div className="stat-badge blue" title="Total number of tracked wallets">
                <FaWallet className="stat-badge-icon" />
                <span className="stat-badge-value">{stats.walletCount}</span>
              </div>
            )}

            {/* Assets count badge */}
            {stats.assetCount !== undefined && (
              <div className="stat-badge purple" title="Total number of crypto assets">
                <FaCoins className="stat-badge-icon" />
                <span className="stat-badge-value">{stats.assetCount}</span>
              </div>
            )}

            {/* Top asset badge */}
            {stats.topAsset && stats.topAsset.symbol !== "N/A" && (
              <div className="stat-badge gold" title={`Top Asset: ${stats.topAsset.symbol} - ${parseFloat(stats.topAsset.value).toLocaleString()}`}>
                <FaStar className="stat-badge-icon" />
                <span className="stat-badge-value">{stats.topAsset.symbol}</span>
              </div>
            )}

            {/* Biggest impact badge */}
            {stats.biggestImpact &&
              stats.biggestImpact.symbol !== "N/A" &&
              parseFloat(stats.biggestImpact.change) !== 0 && (
                <div
                  className={`stat-badge ${parseFloat(stats.biggestImpact.change) > 0 ? "green" : "red"}`}
                  title={`Biggest 24h Impact: ${stats.biggestImpact.symbol} - ${parseFloat(stats.biggestImpact.change) > 0 ? "+" : ""}${parseFloat(stats.biggestImpact.change).toFixed(2)}%`}
                >
                  <FaChartLine className="stat-badge-icon" />
                  <span className="stat-badge-value">{stats.biggestImpact.symbol}</span>
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
                  aria-label={`${formatChangePercent(changePercent)} change in the last 24 hours`}
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

      <style jsx>{`
        .compact-balance-card {
          background: rgba(28, 24, 51, 0.6);
          border-radius: 16px;
          box-shadow: 0 4px 30px rgba(0, 0, 0, 0.1);
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.3s ease;
          width: 100%;
          position: relative;
          padding: 1.25rem;
        }

        .compact-balance-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 6px 25px rgba(125, 103, 255, 0.3);
          border-color: rgba(125, 103, 255, 0.2);
        }

        .balance-card-content {
          display: flex;
          flex-direction: column;
          position: relative;
        }

        /* Stat badges in a single row at top right */
        .compact-stat-badges {
          position: absolute;
          top: 0;
          right: 0;
          display: flex;
          flex-direction: row;
          gap: 0.5rem;
          z-index: 10;
        }

        .stat-badge {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          aspect-ratio: 1 / 1;
          width: 3rem;
          padding: 0.4rem;
          border-radius: 0.5rem;
          background: rgba(28, 24, 51, 0.8);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.1);
          transition: all 0.2s ease;
        }

        .stat-badge:hover {
          transform: translateY(-2px);
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.25);
          border-color: rgba(255, 255, 255, 0.2);
        }

        .stat-badge-icon {
          font-size: 0.9rem;
          margin-bottom: 0.2rem;
        }

        .stat-badge-value {
          font-size: 0.8rem;
          font-weight: 700;
        }

        /* Badge color variations */
        .stat-badge.blue {
          color: #3f8cff;
          border-top: 2px solid rgba(63, 140, 255, 0.4);
        }

        .stat-badge.purple {
          color: #7d67ff;
          border-top: 2px solid rgba(125, 103, 255, 0.4);
        }

        .stat-badge.gold {
          color: #f3ba2f;
          border-top: 2px solid rgba(243, 186, 47, 0.4);
        }

        .stat-badge.green {
          color: #32c376;
          border-top: 2px solid rgba(50, 195, 118, 0.4);
        }

        .stat-badge.red {
          color: #ff4c4c;
          border-top: 2px solid rgba(255, 76, 76, 0.4);
        }

        /* Balance info styles */
        .balance-info {
          display: flex;
          flex-direction: column;
          margin-bottom: 1rem;
          padding-top: 2rem; /* Make room for stat badges */
        }

        .balance-label {
          font-size: 0.875rem;
          font-weight: 500;
          color: rgba(242, 242, 250, 0.8);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .balance-amount {
          display: flex;
          align-items: baseline;
          margin: 0.5rem 0;
        }

        .currency-symbol {
          font-size: 1.5rem;
          font-weight: 400;
          color: #f2f2fa;
          margin-right: 0.25rem;
        }

        .balance-value {
          font-size: 2rem;
          font-weight: 700;
          color: #f2f2fa;
          letter-spacing: 0.02em;
          line-height: 1.2;
        }

        .balance-change {
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .change-label {
          font-size: 0.8rem;
          color: rgba(242, 242, 250, 0.8);
        }

        .change-value {
          font-size: 1rem;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 0.35rem;
        }

        /* Chart styles */
        .balance-chart {
          height: 80px;
          width: 100%;
        }

        /* Responsive adjustments */
        @media (max-width: 640px) {
          .compact-stat-badges {
            position: static;
            margin-top: 1rem;
            justify-content: space-between;
          }

          .stat-badge {
            width: 2.5rem;
            padding: 0.3rem;
          }

          .stat-badge-icon {
            font-size: 0.8rem;
          }
        }
      `}</style>
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