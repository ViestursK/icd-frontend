import React from "react";
import "./WalletTable.css";
import "./skeleton.css"; // Import the skeleton styles

const WalletTable = ({ wallets, isLoading }) => {
  return (
    <div className="wallet-table-container">
      {isLoading ? (
        <table className="wallet-table">
          <thead>
            <tr>
              <th><div className="skeleton skeleton-text small"></div></th>
              <th><div className="skeleton skeleton-text small"></div></th>
              <th><div className="skeleton skeleton-text small"></div></th>
            </tr>
          </thead>
          <tbody>
            {[...Array(3)].map((_, index) => (
              <tr key={index}>
                <td><div className="skeleton skeleton-text medium"></div></td>
                <td><div className="skeleton skeleton-text medium"></div></td>
                <td><div className="skeleton skeleton-text medium"></div></td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <table className="wallet-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Chain</th>
              <th>Balance (USD)</th>
            </tr>
          </thead>
          <tbody>
            {wallets.length > 0 ? (
              wallets.map((wallet, index) => (
                <tr key={index}>
                  <td>{wallet.address}</td>
                  <td>{wallet.chain}</td>
                  <td>{wallet.balance_usd}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="3">No wallets found.</td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

export default WalletTable;
