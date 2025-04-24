import React from "react";
<<<<<<< HEAD
import PropTypes from "prop-types";
import { FaTrashAlt, FaCopy } from "react-icons/fa";
import "./WalletTable.css";
import "./skeleton.css";

const WalletTable = ({ wallets, isLoading, onDeleteClick }) => {
=======
import "./WalletTable.css";
import "./skeleton.css";

const WalletTable = ({ wallets, isLoading }) => {
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
  // Format balance to display with commas and 2 decimal places
  const formatBalance = (balance) => {
    return parseFloat(balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  // Format wallet address to show only beginning and end
  const formatAddress = (address) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

<<<<<<< HEAD
  // Copy wallet address to clipboard
  const copyToClipboard = (address, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);
    
    // Show a temporary "Copied!" tooltip
    const button = e.currentTarget;
    button.setAttribute("data-copied", "true");
    setTimeout(() => {
      button.setAttribute("data-copied", "false");
    }, 2000);
  };

=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
  // Function to render wallet address with tooltip for full address
  const renderWalletAddress = (address) => {
    return (
      <div className="address-container" title={address}>
        <span className="address-text">{formatAddress(address)}</span>
        <button
          className="copy-button"
<<<<<<< HEAD
          onClick={(e) => copyToClipboard(address, e)}
          aria-label="Copy wallet address"
          title="Copy address"
        >
          <FaCopy size={14} />
=======
          onClick={(e) => {
            e.stopPropagation();
            navigator.clipboard.writeText(address);
            // Show a temporary "Copied!" tooltip
            const button = e.target;
            button.setAttribute("data-copied", "true");
            setTimeout(() => {
              button.setAttribute("data-copied", "false");
            }, 2000);
          }}
          aria-label="Copy wallet address"
          title="Copy address"
        >
          <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
            <path d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z" />
          </svg>
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
        </button>
      </div>
    );
  };

  return (
    <div
      className="wallet-table-container"
      role="region"
      aria-label="Wallet holdings"
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
<<<<<<< HEAD
              {onDeleteClick && (
                <th>
                  <div className="skeleton skeleton-text small"></div>
                </th>
              )}
=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
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
<<<<<<< HEAD
                {onDeleteClick && (
                  <td>
                    <div className="skeleton skeleton-text medium"></div>
                  </td>
                )}
=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Actual data table
        <table className="wallet-table">
          <thead>
            <tr>
              <th>Address</th>
              <th>Chain</th>
              <th>Balance (USD)</th>
<<<<<<< HEAD
              {onDeleteClick && <th>Actions</th>}
=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
            </tr>
          </thead>
          <tbody>
            {wallets.length > 0 ? (
              wallets.map((wallet, index) => (
                <tr key={index} className="wallet-row">
                  <td>{renderWalletAddress(wallet.address)}</td>
                  <td className="chain-cell">
                    <span
                      className={`chain-badge ${wallet.chain.toLowerCase()}`}
                    >
                      {wallet.chain}
                    </span>
                  </td>
                  <td className="balance-cell">
                    ${formatBalance(wallet.balance_usd)}
                  </td>
<<<<<<< HEAD
                  {onDeleteClick && (
                    <td className="actions-cell">
                      <button
                        className="action-button delete-button"
                        onClick={() => onDeleteClick(wallet)}
                        aria-label={`Remove ${wallet.chain} wallet`}
                        title="Remove wallet"
                      >
                        <FaTrashAlt size={14} />
                      </button>
                    </td>
                  )}
=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
                </tr>
              ))
            ) : (
              <tr className="empty-state">
<<<<<<< HEAD
                <td colSpan={onDeleteClick ? 4 : 3}>
=======
                <td colSpan="3">
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
                  <div className="empty-message">
                    <svg
                      viewBox="0 0 24 24"
                      width="24"
                      height="24"
                      fill="currentColor"
                    >
                      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                    </svg>
                    <p>
                      No wallets found. Add your first wallet to get started.
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

<<<<<<< HEAD
WalletTable.propTypes = {
  wallets: PropTypes.array,
  isLoading: PropTypes.bool,
  onDeleteClick: PropTypes.func
};

export default WalletTable;
=======
export default WalletTable;
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
