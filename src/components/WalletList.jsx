import React, {
  useState,
  useCallback,
  useMemo,
  useRef,
  useEffect,
} from "react";
import PropTypes from "prop-types";
import {
  FaSearch,
  FaTimes,
  FaPencilAlt,
  FaCheck,
  FaSave,
  FaUndo,
  FaTrashAlt,
  FaCopy,
} from "react-icons/fa";
import "../styles/tableUtils.css"; // Import common styles
import "./WalletList.css";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";

const WalletList = ({ wallets, isLoading, onDeleteClick }) => {
  // Search and filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");
  const [visibleCount, setVisibleCount] = useState(15);

  // Inline editing state
  const [editingWalletId, setEditingWalletId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  // Local state to track optimistic updates
  const [optimisticWallets, setOptimisticWallets] = useState([]);

  // Ref for the edit input field
  const editInputRef = useRef(null);

  const { updateWalletName } = useWallet();
  const toast = useToast();

  // Update optimistic wallets when actual wallets change
  useEffect(() => {
    setOptimisticWallets(wallets);
  }, [wallets]);

  // Auto-focus edit input when editing starts
  useEffect(() => {
    if (editingWalletId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingWalletId]);

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

  // Create a unique wallet ID for tracking the editing state
  const getWalletId = (wallet) => {
    return `${wallet.chain}-${wallet.address}`;
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
    const chains = optimisticWallets
      .map((wallet) => wallet.chain?.toLowerCase())
      .filter(Boolean);
    return ["all", ...new Set(chains)].filter((chain) => chain);
  }, [optimisticWallets]);

  // Filter wallets based on search query and selected chain
  const filteredWallets = useMemo(() => {
    return optimisticWallets.filter((wallet) => {
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
  }, [optimisticWallets, searchQuery, selectedChain]);

  // Slice for pagination
  const visibleWallets = useMemo(() => {
    return filteredWallets.slice(0, visibleCount);
  }, [filteredWallets, visibleCount]);

  // Start editing wallet name
  const startEditingName = (wallet, e) => {
    if (e) e.stopPropagation();
    setEditingWalletId(getWalletId(wallet));
    setEditedName(wallet.name || "");
  };

  // Cancel editing
  const cancelEditing = (e) => {
    if (e) e.stopPropagation();
    setEditingWalletId(null);
    setEditedName("");
  };

  // Handle key press in edit input
  const handleKeyPress = (e, wallet) => {
    if (e.key === "Enter") {
      saveWalletName(wallet, e);
    } else if (e.key === "Escape") {
      cancelEditing(e);
    }
  };

  // Save wallet name with optimistic update
  const saveWalletName = async (wallet, e) => {
    if (e) e.stopPropagation();
    if (!wallet) return;

    // Don't save if nothing changed or name is empty
    if ((wallet.name || "") === editedName.trim()) {
      cancelEditing(e);
      return;
    }

    setSavingName(true);

    // Create a new name value from the input
    const newName = editedName.trim();

    // OPTIMISTIC UPDATE: Update local state immediately
    setOptimisticWallets((prevWallets) =>
      prevWallets.map((w) => {
        if (w.address === wallet.address && w.chain === wallet.chain) {
          return { ...w, name: newName };
        }
        return w;
      })
    );

    // Exit editing mode immediately for better UX
    setEditingWalletId(null);

    // Show a temporary processing toast
    const toastId = toast.info("Updating wallet name...", { duration: 2000 });

    try {
      // Make the actual API call
      const result = await updateWalletName({
        address: wallet.address,
        chain: wallet.chain,
        name: newName,
      });

      if (result.success) {
        // Success toast
        toast.success("Wallet name updated successfully");
      } else {
        // If failed, revert the optimistic update
        setOptimisticWallets(wallets); // revert to original wallets
        toast.error("Failed to update wallet name");
      }
    } catch (error) {
      // If error, revert the optimistic update
      setOptimisticWallets(wallets);
      toast.error("An error occurred while updating the wallet name");
    } finally {
      setSavingName(false);
    }
  };

  // Handle showing more wallets
  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => prev + 10);
  }, []);

  // Handle view wallet
  const handleViewWallet = (wallet) => {
    window.location.href = `/dashboard/wallet/${wallet.chain}/${wallet.address}`;
  };

  return (
    <div
      className="wallet-list-container"
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
                Showing{" "}
                {Math.min(visibleWallets.length, filteredWallets.length)} of{" "}
                {filteredWallets.length} wallets
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedChain !== "all" &&
                  ` on ${selectedChain.toUpperCase()}`}
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
        <div className="wallet-list-skeleton">
          {[...Array(3)].map((_, index) => (
            <div key={index} className="wallet-card skeleton">
              <div className="wallet-card-header">
                <div className="skeleton-text small"></div>
                <div className="skeleton-text medium"></div>
              </div>
              <div className="wallet-card-body">
                <div className="skeleton-text small"></div>
                <div className="skeleton-text medium"></div>
              </div>
              <div className="wallet-card-footer">
                <div className="skeleton-text small"></div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        // Wallet cards grid
        <div className="wallet-cards-grid">
          {visibleWallets.length > 0 ? (
            visibleWallets.map((wallet, index) => (
              <div
                key={getWalletId(wallet)}
                className="wallet-card"
                onClick={() => handleViewWallet(wallet)}
              >
                <div className="wallet-card-header">
                  <span className={`chain-badge ${wallet.chain.toLowerCase()}`}>
                    {wallet.chain.toUpperCase()}
                  </span>

                  {editingWalletId === getWalletId(wallet) ? (
                    <div
                      className="wallet-name-edit"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        ref={editInputRef}
                        type="text"
                        value={editedName}
                        onChange={(e) => setEditedName(e.target.value)}
                        onKeyDown={(e) => handleKeyPress(e, wallet)}
                        className="wallet-name-input"
                        placeholder="Enter wallet name"
                        disabled={savingName}
                        maxLength={30}
                      />
                      <div className="name-edit-actions">
                        <button
                          className="name-edit-button save"
                          onClick={(e) => saveWalletName(wallet, e)}
                          disabled={savingName}
                          title="Save name"
                        >
                          <FaSave />
                        </button>
                        <button
                          className="name-edit-button cancel"
                          onClick={(e) => cancelEditing(e)}
                          disabled={savingName}
                          title="Cancel"
                        >
                          <FaUndo />
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="wallet-name-display">
                      <span className="wallet-name">
                        {wallet.name ||
                          `${wallet.chain.toUpperCase()} Wallet ${index + 1}`}
                      </span>
                      <button
                        className="edit-name-button"
                        onClick={(e) => startEditingName(wallet, e)}
                        aria-label="Edit wallet name"
                        title="Edit name"
                      >
                        <FaPencilAlt />
                      </button>
                    </div>
                  )}
                </div>

                <div className="wallet-card-body">
                  <div className="address-container" title={wallet.address}>
                    <span className="address-label">Address:</span>
                    <span className="address-text">
                      {formatAddress(wallet.address)}
                    </span>
                    <button
                      className="copy-button"
                      onClick={(e) => copyToClipboard(wallet.address, e)}
                      aria-label="Copy wallet address"
                      title="Copy address"
                    >
                      <FaCopy />
                    </button>
                  </div>

                  <div className="balance-container">
                    <span className="balance-label">Balance:</span>
                    <span className="balance-value">
                      ${formatBalance(wallet.balance_usd)}
                    </span>
                  </div>
                </div>

                <div className="wallet-card-footer">
                  <button
                    className="wallet-action-button view"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleViewWallet(wallet);
                    }}
                  >
                    View Assets
                  </button>

                  {onDeleteClick && (
                    <button
                      className="wallet-action-button delete"
                      onClick={(e) => {
                        e.stopPropagation();
                        onDeleteClick(wallet);
                      }}
                      aria-label={`Remove ${wallet.chain} wallet`}
                      title="Remove wallet"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </div>
            ))
          ) : (
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
          )}
        </div>
      )}

      {/* Show more button */}
      {!isLoading && visibleCount < filteredWallets.length && (
        <button onClick={handleShowMore} className="show-more-button">
          Show more wallets ({visibleCount} of {filteredWallets.length})
        </button>
      )}
    </div>
  );
};

WalletList.propTypes = {
  wallets: PropTypes.array,
  isLoading: PropTypes.bool,
  onDeleteClick: PropTypes.func,
};

WalletList.defaultProps = {
  wallets: [],
  isLoading: false,
};

export default WalletList;
