import React, { useState, useRef, useEffect } from "react";
import {
  FaWallet,
  FaChevronDown,
  FaChevronUp,
  FaExternalLinkAlt,
  FaPlus,
} from "react-icons/fa";
import { Link, useNavigate } from "react-router-dom";
import "./WalletSelector.css";

/**
 * WalletSelector component displays a dropdown for selecting a specific wallet
 * or viewing all wallets, with an option to add a new wallet.
 *
 * @param {Object} props
 * @param {Array} props.wallets - List of wallet objects
 * @param {Object|null} props.selectedWallet - Currently selected wallet or null if viewing all
 * @param {Function} props.onWalletSelect - Callback when a wallet is selected
 * @param {Function} props.onAddWalletClick - Callback to handle add wallet action
 */
const WalletSelector = ({
  wallets,
  selectedWallet,
  onWalletSelect,
  onAddWalletClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);
  const navigate = useNavigate();

  // Format balance to display with commas and 2 decimal places
  const formatBalance = (balance) => {
    return parseFloat(balance || 0).toLocaleString("en-US", {
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

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle wallet selection
  const handleSelectWallet = (wallet) => {
    setIsOpen(false);
    onWalletSelect(wallet);

    // If wallet is selected, navigate to its specific view
    if (wallet) {
      navigate(`/dashboard/wallet/${wallet.chain}/${wallet.address}`);
    } else {
      // If null is selected (All Wallets option), navigate to main dashboard
      navigate("/dashboard");
    }
  };

  // Handle add wallet click
  const handleAddWalletClick = () => {
    setIsOpen(false);
    if (onAddWalletClick) {
      onAddWalletClick();
    }
  };

  // Toggle dropdown open/close
  const toggleDropdown = () => {
    setIsOpen(!isOpen);
  };

  // Get the display name for the selected wallet in the toggle button
  const getSelectedWalletDisplayName = () => {
    if (!selectedWallet) return "All Wallets";

    if (selectedWallet.name) {
      return selectedWallet.name;
    }

    return formatAddress(selectedWallet.address);
  };

  return (
    <div className="wallet-selector" ref={dropdownRef}>
      <button
        className="wallet-selector-toggle"
        onClick={toggleDropdown}
        aria-expanded={isOpen}
        aria-label="Select wallet"
      >
        {selectedWallet ? (
          <>
            <span
              className={`chain-badge mini ${selectedWallet.chain.toLowerCase()}`}
            >
              {selectedWallet.chain.toUpperCase()}
            </span>
            <span className="wallet-selector-address">
              {getSelectedWalletDisplayName()}
            </span>
          </>
        ) : (
          <>
            <FaWallet />
            <span className="wallet-selector-all">All Wallets</span>
          </>
        )}
        {isOpen ? <FaChevronUp /> : <FaChevronDown />}
      </button>

      {isOpen && (
        <div className="wallet-selector-dropdown">
          <div className="wallet-selector-header">
            <h4>Select Wallet</h4>
          </div>

          {/* All Wallets option */}
          <div
            className={`wallet-selector-item ${
              !selectedWallet ? "active" : ""
            }`}
            onClick={() => handleSelectWallet(null)}
          >
            <div className="wallet-selector-item-icon">
              <FaWallet />
            </div>
            <div className="wallet-selector-item-details">
              <span className="wallet-selector-item-name">All Wallets</span>
              <span className="wallet-selector-item-balance">
                $
                {formatBalance(
                  wallets.reduce(
                    (sum, wallet) => sum + parseFloat(wallet.balance_usd || 0),
                    0
                  )
                )}
              </span>
            </div>
          </div>

          {/* Individual wallet options */}
          {wallets.map((wallet, index) => (
            <div
              key={`${wallet.chain}-${wallet.address}`}
              className={`wallet-selector-item ${
                selectedWallet &&
                selectedWallet.address === wallet.address &&
                selectedWallet.chain === wallet.chain
                  ? "active"
                  : ""
              }`}
              onClick={() => handleSelectWallet(wallet)}
            >
              <div className="wallet-selector-item-icon">
                <span className={`chain-badge ${wallet.chain.toLowerCase()}`}>
                  {wallet.chain.substring(0, 1).toUpperCase()}
                </span>
              </div>
              <div className="wallet-selector-item-details">
                <span className="wallet-selector-item-name">
                  {wallet.name || formatAddress(wallet.address)}
                </span>
                <div className="wallet-selector-item-meta">
                  <span className="wallet-selector-item-chain">
                    {wallet.chain.toUpperCase()}
                  </span>
                  <span className="wallet-selector-item-balance">
                    ${formatBalance(wallet.balance_usd)}
                  </span>
                </div>
              </div>
            </div>
          ))}
          <div className="wallet-selector-footer"></div>
        </div>
      )}
    </div>
  );
};

export default WalletSelector;
