import React from "react";
import "./WalletTable.css"; // Reuse WalletTable styles
import "./skeleton.css";

const AssetTable = ({ assets = [], isLoading }) => {
  // Format balance to display with commas and 2 decimal places
  const formatBalance = (balance) => {
    return parseFloat(balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
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
              <th>Price</th>
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
                      <span
                        className={`asset-icon ${asset.symbol.toLowerCase()}`}
                      >
                        {asset.symbol.substring(0, 1)}
                      </span>
                      <div className="asset-name-container">
                        <span className="asset-name">{asset.name}</span>
                        <span className="asset-symbol">{asset.symbol}</span>
                      </div>
                    </div>
                  </td>
                  <td>${formatBalance(asset.price)}</td>
                  <td>
                    {asset.amount} {asset.symbol}
                  </td>
                  <td className="balance-cell">
                    ${formatBalance(asset.value_usd)}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-state">
                <td colSpan="4">
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
                      No assets found. Add wallets or exchanges to track your
                      assets.
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

export default AssetTable;
