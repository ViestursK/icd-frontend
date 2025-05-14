import React from "react";
import { Link } from "react-router-dom";
import { FaHome, FaChevronRight, FaWallet } from "react-icons/fa";
import "./ViewIndicator.css";

/**
 * ViewIndicator component shows a breadcrumb-style path of what the user is currently viewing
 *
 * @param {Object} props
 * @param {Object|null} props.currentWallet - Currently selected wallet or null for aggregated view
 */
const ViewIndicator = ({ currentWallet }) => {
  // Format wallet address to show only beginning and end
  const formatAddress = (address) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  return (
    <div className="view-indicator">
      <Link to="/dashboard" className="view-indicator-item home">
        <FaHome className="view-indicator-icon" />
        <span className="view-indicator-text">All Wallets</span>
      </Link>

      {currentWallet && (
        <>
          <FaChevronRight className="view-indicator-separator" />
          <div className="view-indicator-item wallet">
            <FaWallet className="view-indicator-icon" />
            <div className="view-indicator-wallet-info">
              <span className="view-indicator-chain">
                {currentWallet.chain.toUpperCase()}
              </span>
              <span className="view-indicator-address">
                {formatAddress(currentWallet.address)}
              </span>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ViewIndicator;
