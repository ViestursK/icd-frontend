// StatsCard.jsx
import React from "react";
import PropTypes from "prop-types";
import { FaWallet, FaCoins, FaStar, FaChartLine } from "react-icons/fa";
import "./StatsCard.css";

const StatsCard = ({ stats, isLoading }) => {
  if (isLoading || !stats) {
    return (
      <div className="stats-card">
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-badge"></div>
        <div className="skeleton skeleton-badge"></div>
      </div>
    );
  }

  const { walletCount, assetCount, topAsset, biggestImpact } = stats;

  return (
    <div className="stats-card">
      <div className="stat-badge blue" title="Tracked Wallets">
        <FaWallet className="stat-badge-icon" />
        <span className="stat-badge-value">{walletCount}</span>
        <span className="stat-badge-label">Wallets</span>
      </div>

      <div className="stat-badge purple" title="Tracked Crypto Assets">
        <FaCoins className="stat-badge-icon" />
        <span className="stat-badge-value">{assetCount}</span>
        <span className="stat-badge-label">Assets</span>
      </div>

      {topAsset?.symbol !== "N/A" && (
        <div
          className="stat-badge gold"
          title={`Top Asset: ${topAsset.symbol} - $${parseFloat(
            topAsset.value
          ).toLocaleString()}`}
        >
          <FaStar className="stat-badge-icon" />
          <span className="stat-badge-value">{topAsset.symbol}</span>
          <span className="stat-badge-label">Top</span>
        </div>
      )}

      {biggestImpact?.symbol !== "N/A" &&
        parseFloat(biggestImpact.change) !== 0 && (
          <div
            className={`stat-badge ${
              parseFloat(biggestImpact.change) > 0 ? "green" : "red"
            }`}
            title={`24h Impact: ${biggestImpact.symbol} ${
              parseFloat(biggestImpact.change) > 0 ? "+" : ""
            }${parseFloat(biggestImpact.change).toFixed(2)}%`}
          >
            <FaChartLine className="stat-badge-icon" />
            <span className="stat-badge-value">{biggestImpact.symbol}</span>
            <span className="stat-badge-label">Impact</span>
          </div>
        )}
    </div>
  );
};

StatsCard.propTypes = {
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
  isLoading: PropTypes.bool,
};

export default StatsCard;
