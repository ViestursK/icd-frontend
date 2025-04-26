import React from "react";
import PropTypes from "prop-types";
import { FaWallet, FaCoins, FaStar, FaChartLine } from "react-icons/fa";
import "./StatsCards.css";
import "./skeleton.css";

const StatsCards = ({ stats, isLoading }) => {
  // Format number with commas and decimal places
  const formatNumber = (number, decimalPlaces = 2) => {
    if (!number || isNaN(parseFloat(number))) return "0.00";
    return parseFloat(number).toLocaleString("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  // Define the cards to display
  const statCards = [
    {
      id: "wallets",
      label: "Wallets",
      value: stats.walletCount || 0,
      icon: <FaWallet className="stat-card-icon" />,
      format: (val) => val, // No formatting needed for count
      color: "blue",
    },
    {
      id: "assets",
      label: "Assets",
      value: stats.assetCount || 0,
      icon: <FaCoins className="stat-card-icon" />,
      format: (val) => val, // No formatting needed for count
      color: "purple",
    },
    {
      id: "top-asset",
      label: "Top Asset",
      value: stats.topAsset || { symbol: "N/A", value: "0" },
      icon: <FaStar className="stat-card-icon" />,
      format: (val) => (
        <>
          <span className="stat-card-value-symbol">{val.symbol}</span>
          <span className="stat-card-value-amount">
            ${formatNumber(val.value)}
          </span>
        </>
      ),
      color: "gold",
    },
    {
      id: "price-impact",
      label: "Price Impact",
      value: {
        value: stats.biggestImpact?.value || 0,
        symbol: stats.biggestImpact?.symbol || "N/A",
        change: stats.biggestImpact?.change || 0,
      },
      icon: <FaChartLine className="stat-card-icon" />,
      format: (val) => {
        const isPositive = parseFloat(val.change) > 0;
        return (
          <div
            className={`stat-card-impact ${
              isPositive ? "positive" : "negative"
            }`}
          >
            <span className="stat-card-value-symbol">{val.symbol}</span>
            <span className="stat-card-value-change">
              {isPositive ? "+" : ""}
              {parseFloat(val.change).toFixed(2)}%
            </span>
          </div>
        );
      },
      color: "gradient",
    },
  ];

  if (isLoading) {
    return (
      <div className="stats-cards-container">
        {[...Array(4)].map((_, i) => (
          <div className="stat-card-skeleton" key={i}>
            <div className="skeleton skeleton-text medium"></div>
            <div className="skeleton skeleton-text large"></div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="stats-cards-container">
      {statCards.map((card) => (
        <div className={`stat-card ${card.color}`} key={card.id}>
          <div className="stat-card-header">
            <span className="stat-card-label">{card.label}</span>
            {card.icon}
          </div>
          <div className="stat-card-value">{card.format(card.value)}</div>
        </div>
      ))}
    </div>
  );
};

StatsCards.propTypes = {
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

StatsCards.defaultProps = {
  stats: {
    walletCount: 0,
    assetCount: 0,
    topAsset: { symbol: "N/A", value: "0" },
    biggestImpact: { symbol: "N/A", value: "0", change: "0" },
  },
  isLoading: false,
};

export default StatsCards;
