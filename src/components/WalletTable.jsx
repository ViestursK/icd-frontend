import React from "react";
import "./WalletTable.css";

const WalletTable = ({ wallets, isLoading }) => {
  return (
    <div>
      {isLoading ? (
        <div className="wallet-loading">Loading wallets...</div>
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
