// Updated WalletTable.jsx to display and edit wallet names
import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import {
  FaTrashAlt,
  FaCopy,
  FaSearch,
  FaTimes,
  FaEdit,
  FaCheck,
  FaPencilAlt,
  FaTag,
} from "react-icons/fa";
import "./WalletTable.css";
import "./skeleton.css";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";

const WalletTable = ({ wallets, isLoading, onDeleteClick }) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");
  const [visibleCount, setVisibleCount] = useState(15);
  const [editingWallet, setEditingWallet] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [savingName, setSavingName] = useState(false);

  const { updateWalletName } = useWallet();
  const toast = useToast();
  const modalRef = useRef(null);
  const inputRef = useRef(null);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        cancelEdit();
      }
    }

    if (isEditModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Focus the input
      if (inputRef.current) {
        inputRef.current.focus();
        inputRef.current.select();
      }
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isEditModalOpen]);

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

  // Clear search query
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Get unique chains for filter
  const uniqueChains = useMemo(() => {
    const chains = wallets
      .map((wallet) => wallet.chain?.toLowerCase())
      .filter(Boolean);
    return ["all", ...new Set(chains)].filter((chain) => chain);
  }, [wallets]);

  // Filter wallets based on search query and selected chain
  const filteredWallets = useMemo(() => {
    return wallets.filter((wallet) => {
      // Search in address, chain fields, and name fields
      const matchesSearch =
        !searchQuery ||
        wallet.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.chain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wallet.name &&
          wallet.name.toLowerCase().includes(searchQuery.toLowerCase()));

      // Filter by chain if not "all"
      const matchesChain =
        selectedChain === "all" ||
        wallet.chain?.toLowerCase() === selectedChain;

      return matchesSearch && matchesChain;
    });
  }, [wallets, searchQuery, selectedChain]);

  // Slice for pagination
  const visibleWallets = useMemo(() => {
    return filteredWallets.slice(0, visibleCount);
  }, [filteredWallets, visibleCount]);

  // Open edit name modal
  const openEditNameModal = (wallet) => {
    setEditingWallet(wallet);
    setEditedName(wallet.name || "");
    setIsEditModalOpen(true);
  };

  // Cancel edit
  const cancelEdit = () => {
    setEditingWallet(null);
    setEditedName("");
    setIsEditModalOpen(false);
  };

  // Save wallet name
  const saveWalletName = async () => {
    if (!editingWallet) return;

    setSavingName(true);
    try {
      const result = await updateWalletName({
        address: editingWallet.address,
        chain: editingWallet.chain,
        name: editedName.trim(),
      });

      if (result.success) {
        toast.success("Wallet name updated successfully");
        setIsEditModalOpen(false);
        setEditingWallet(null);
      } else {
        toast.error("Failed to update wallet name");
      }
    } catch (error) {
      toast.error("An error occurred while updating the wallet name");
    } finally {
      setSavingName(false);
    }
  };

  // Function to render wallet address with tooltip for full address
  const renderWalletAddress = (address) => {
    return (
      <div className="address-container" title={address}>
        <span className="address-text">{formatAddress(address)}</span>
        <button
          className="copy-button"
          onClick={(e) => copyToClipboard(address, e)}
          aria-label="Copy wallet address"
          title="Copy address"
        >
          <FaCopy size={14} />
        </button>
      </div>
    );
  };

  // Handle showing more wallets
  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => prev + 10);
  }, []);

  return (
    <div
      className="wallet-table-container"
      role="region"
      aria-label="Wallet holdings"
    >
      {/* Search and Filter Controls */}
      {!isLoading && (
        <div className="table-controls">
          <div className="search-container">
            <div className="search-input-wrapper">
              <FaSearch className="search-icon" />
              <input
                type="text"
                placeholder="Search by name, address or chain..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="search-input"
              />
              {searchQuery && (
                <button
                  onClick={clearSearch}
                  className="clear-search"
                  aria-label="Clear search"
                >
                  <FaTimes />
                </button>
              )}
            </div>

            {filteredWallets.length > 0 && (
              <div className="search-results-count">
                {Math.min(visibleWallets.length, filteredWallets.length)} of{" "}
                {filteredWallets.length}
              </div>
            )}
          </div>

          <div className="filter-container">
            <div className="filter-buttons">
              {uniqueChains.map((chain) => (
                <button
                  key={chain}
                  className={`filter-button ${
                    selectedChain === chain ? "active" : ""
                  }`}
                  onClick={() => setSelectedChain(chain)}
                >
                  {chain === "all" ? "All Chains" : chain.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

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
              {onDeleteClick && (
                <th>
                  <div className="skeleton skeleton-text small"></div>
                </th>
              )}
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
                {onDeleteClick && (
                  <td>
                    <div className="skeleton skeleton-text medium"></div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        // Actual data table
        <table className="wallet-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Address</th>
              <th>Chain</th>
              <th>Balance (USD)</th>
              {onDeleteClick && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {visibleWallets.length > 0 ? (
              visibleWallets.map((wallet, index) => (
                <tr key={index} className="wallet-row">
                  <td className="wallet-name-cell">
                    <div className="wallet-name-container">
                      <div className="wallet-name-display">
                        <span
                          className="wallet-name"
                          title={wallet.name || wallet.address}
                        >
                          {wallet.name ||
                            `${wallet.chain.toUpperCase()} Wallet ${index + 1}`}
                        </span>
                        <button
                          className="edit-name-button"
                          onClick={() => openEditNameModal(wallet)}
                          aria-label="Edit wallet name"
                          title="Edit name"
                        >
                          <FaPencilAlt />
                        </button>
                      </div>
                    </div>
                  </td>
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
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={onDeleteClick ? 5 : 4}
                  className="empty-state-cell"
                >
                  <div className="empty-state-container">
                    <div className="empty-message">
                      <svg
                        viewBox="0 0 24 24"
                        width="48"
                        height="48"
                        fill="currentColor"
                      >
                        <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                      </svg>
                      <p>
                        {searchQuery || selectedChain !== "all"
                          ? "No wallets found matching your search criteria."
                          : "No wallets found. Add your first wallet to get started."}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}

      {/* Show more button */}
      {!isLoading && visibleCount < filteredWallets.length && (
        <button onClick={handleShowMore} className="show-more-button">
          Show more wallets ({visibleCount} of {filteredWallets.length})
        </button>
      )}

      {/* Edit name modal */}
      {isEditModalOpen && editingWallet && (
        <div className="name-edit-modal-overlay">
          <div className="name-edit-modal" ref={modalRef}>
            <div className="name-edit-modal-header">
              <h3>Edit Wallet Name</h3>
            </div>
            <div className="name-edit-modal-form">
              <div className="form-group">
                <label htmlFor="wallet-name-edit" className="form-label">
                  Wallet Name
                </label>
                <div className="input-wrapper">
                  <FaTag className="input-icon" />
                  <input
                    ref={inputRef}
                    type="text"
                    id="wallet-name-edit"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    placeholder="Enter a name for this wallet"
                    className="form-input with-icon"
                    disabled={savingName}
                  />
                </div>
                <p className="form-hint">
                  A descriptive name helps identify this wallet in your
                  portfolio.
                </p>
              </div>
              <div className="wallet-details-info">
                <div className="wallet-details-item">
                  <span className="wallet-details-label">Address:</span>
                  <span className="wallet-details-value">
                    {formatAddress(editingWallet.address)}
                  </span>
                </div>
                <div className="wallet-details-item">
                  <span className="wallet-details-label">Chain:</span>
                  <span className="wallet-details-value">
                    {editingWallet.chain.toUpperCase()}
                  </span>
                </div>
              </div>
              <div className="name-edit-modal-actions">
                <button
                  className="name-edit-modal-button cancel"
                  onClick={cancelEdit}
                  disabled={savingName}
                >
                  Cancel
                </button>
                <button
                  className="name-edit-modal-button save"
                  onClick={saveWalletName}
                  disabled={savingName}
                >
                  {savingName ? "Saving..." : "Save"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

WalletTable.propTypes = {
  wallets: PropTypes.array,
  isLoading: PropTypes.bool,
  onDeleteClick: PropTypes.func,
};

WalletTable.defaultProps = {
  wallets: [],
  isLoading: false,
};

export default WalletTable;
