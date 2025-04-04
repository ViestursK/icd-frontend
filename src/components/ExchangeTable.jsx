import React from "react";
import "./WalletTable.css"; // Reuse WalletTable styles
import "./skeleton.css";

const ExchangeTable = ({ exchanges = [], isLoading }) => {
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
      aria-label="Exchange accounts"
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
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Actual data table
        <table className="wallet-table">
          <thead>
            <tr>
              <th>Exchange</th>
              <th>Account</th>
              <th>Balance (USD)</th>
            </tr>
          </thead>
          <tbody>
            {exchanges.length > 0 ? (
              exchanges.map((exchange, index) => (
                <tr key={index} className="wallet-row">
                  <td className="exchange-cell">
                    <div className="exchange-info">
                      <span
                        className={`exchange-icon ${exchange.name.toLowerCase()}`}
                      >
                        {exchange.name.substring(0, 1)}
                      </span>
                      <span className="exchange-name">{exchange.name}</span>
                    </div>
                  </td>
                  <td>{exchange.account_name || "Main Account"}</td>
                  <td className="balance-cell">
                    ${formatBalance(exchange.balance_usd)}
                  </td>
                </tr>
              ))
            ) : (
              <tr className="empty-state">
                <td colSpan="3">
                  <div className="empty-message">
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="currentColor"
                    >
                      <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm0 16H5V5h14v14z" />
                      <path d="M7 10h2v7H7zm4-3h2v10h-2zm4 6h2v4h-2z" />
                    </svg>
                    <p>
                      No exchanges linked. Add your exchange accounts to track
                      them.
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

export default ExchangeTable;
