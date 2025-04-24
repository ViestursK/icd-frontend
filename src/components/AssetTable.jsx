import React from "react";
import PropTypes from "prop-types";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import "./WalletTable.css"; // Reuse WalletTable styles
import "./AssetTable.css"; // Specific styles for asset table
import "./skeleton.css";

const AssetTable = ({ assets = [], isLoading }) => {
  // Format number to display with commas and 2 decimal places
  const formatNumber = (number, decimalPlaces = 2) => {
    if (!number || isNaN(parseFloat(number))) return "0.00";
    return parseFloat(number).toLocaleString("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  // Format crypto amount with appropriate decimal precision
  const formatCryptoAmount = (amount, symbol) => {
    // Use more decimal places for small-value tokens like BTC
    const decimalPlaces = ["BTC", "ETH", "WBTC"].includes(symbol) ? 6 : 2;
    return formatNumber(amount, decimalPlaces);
  };

  // Get appropriate icon based on change
  const getChangeIcon = (changePercent) => {
    if (!changePercent || isNaN(parseFloat(changePercent))) return null;
    
    const numericChange = parseFloat(changePercent);
    if (numericChange > 0) return <FaCaretUp className="change-icon up" />;
    if (numericChange < 0) return <FaCaretDown className="change-icon down" />;
    return null;
  };

  // Format percent change with + or - sign
  const formatPercentChange = (change) => {
    if (!change || isNaN(parseFloat(change))) return "0.00%";
    const numericChange = parseFloat(change);
    const sign = numericChange >= 0 ? "+" : "";
    return `${sign}${numericChange.toFixed(2)}%`;
  };

  // Render asset icon - either with logo image or fallback to letter icon
  const renderAssetIcon = (asset) => {
    // Generate the lowercase symbol for CSS class
    const symbolClass = asset.symbol.toLowerCase();
    
    if (asset.logo) {
      return (
        <>
          <img 
            src={asset.thumbnail || asset.logo} 
            alt={asset.symbol} 
            className="asset-logo"
            onError={(e) => {
              e.target.style.display = 'none';
              e.target.nextSibling.style.display = 'flex';
            }}
          />
          <span 
            className={`asset-icon ${symbolClass}`}
            style={{ display: 'none' }}
          >
            {asset.symbol.substring(0, 1)}
          </span>
        </>
      );
    }
    
    // Fallback to letter icon
    return (
      <span className={`asset-icon ${symbolClass}`}>
        {asset.symbol.substring(0, 1)}
      </span>
    );
  };

  return (
    <div
      className="wallet-table-container"
      role="region"
      aria-label="Asset holdings"
    >
      {isLoading ? (
        // Skeleton loading state
        <table className="wallet-table">
          <thead>
            <tr>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, index) => (
              <tr key={index} className="wallet-row skeleton-row">
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Actual data table
        <table className="wallet-table">
          <thead>
            <tr>
              <th>Asset</th>
              <th>Price (USD)</th>
              <th>24h Change</th>
              <th>Holdings</th>
              <th>Value (USD)</th>
            </tr>
          </thead>
          <tbody>
            {assets.length > 0 ? (
              assets.map((asset, index) => (
                <tr key={index} className="wallet-row">
                  <td className="asset-cell">
                    <div className="asset-info">
                      {renderAssetIcon(asset)}
                      <div className="asset-name-container">
                        <span className="asset-name">{asset.name}</span>
                        <span className="asset-symbol">{asset.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td>${formatNumber(asset.price)}</td>
                  <td>
                    <div className={`price-change-container ${parseFloat(asset.price_24h_change_percent) >= 0 ? "positive-change" : "negative-change"}`}>
                      {getChangeIcon(asset.price_24h_change_percent)}
                      <span>{formatPercentChange(asset.price_24h_change_percent)}</span>
                    </div>
                  </td>
                  <td>
                    {formatCryptoAmount(asset.total_amount, asset.symbol)} {asset.symbol}
                  </td>
                  <td className="balance-cell">
                    ${formatNumber(asset.total_value)}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-state">
                <td colSpan="5">
                  <div className="empty-message">
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="currentColor"
                    >
                      <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm0-14c-2.21 0-4 1.79-4 4h2c0-1.1.9-2 2-2s2 .9 2 2c0 2-3 1.75-3 5h2c0-2.25 3-2.5 3-5 0-2.21-1.79-4-4-4z" />
                    </svg>
                    <p>
                      No assets found. Add wallets to track your assets.
                    </p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

AssetTable.propTypes = {
  assets: PropTypes.array,
  isLoading: PropTypes.bool
};

export default AssetTable;
