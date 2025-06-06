import React, { useState, useCallback, useMemo, useEffect } from "react";
import PropTypes from "prop-types";
import {
  FaSearch,
  FaTimes,
  FaPencilAlt,
  FaSave,
  FaTrashAlt,
  FaCopy,
  FaTag,
} from "react-icons/fa";
import "../styles/tableUtils.css";
import "./WalletList.css";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";

const WalletList = ({ wallets, isLoading, onDeleteClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");
  const [visibleCount, setVisibleCount] = useState(15);
  const [optimisticWallets, setOptimisticWallets] = useState([]);

  // States for edit name modal
  const [showEditModal, setShowEditModal] = useState(false);
  const [editWallet, setEditWallet] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);

  const { updateWalletName } = useWallet();
  const toast = useToast();

  useEffect(() => {
    setOptimisticWallets(wallets);
  }, [wallets]);

  // Global loading - show shimmer for entire grid
  if (isLoading) {
    return (
      <div
        className="wallet-list-container"
        role="region"
        aria-label="Wallet holdings"
      >
        <div className="wallet-cards-grid shimmer-loading"></div>
      </div>
    );
  }

  // Helper functions
  const formatBalance = (balance) => {
    return parseFloat(balance).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatAddress = (address) => {
    if (!address) return "";
    if (address.length <= 12) return address;
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  const getWalletId = (wallet) => {
    return `${wallet.chain}-${wallet.address}`;
  };

  const copyToClipboard = (address, e) => {
    e.stopPropagation();
    navigator.clipboard.writeText(address);

    const button = e.currentTarget;
    button.setAttribute("data-copied", "true");
    setTimeout(() => {
      toast.info("Wallet copied to clipboard!");
    }, 0);
  };

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const uniqueChains = useMemo(() => {
    const chains = optimisticWallets
      .map((wallet) => wallet.chain?.toLowerCase())
      .filter(Boolean);
    return ["all", ...new Set(chains)].filter((chain) => chain);
  }, [optimisticWallets]);

  const filteredWallets = useMemo(() => {
    return optimisticWallets.filter((wallet) => {
      const matchesSearch =
        !searchQuery ||
        wallet.address?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        wallet.chain?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (wallet.name &&
          wallet.name.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesChain =
        selectedChain === "all" ||
        wallet.chain?.toLowerCase() === selectedChain;

      return matchesSearch && matchesChain;
    });
  }, [optimisticWallets, searchQuery, selectedChain]);

  const visibleWallets = useMemo(() => {
    return filteredWallets.slice(0, visibleCount);
  }, [filteredWallets, visibleCount]);

  // Open edit name modal
  const handleEditNameClick = (wallet, e) => {
    if (e) e.stopPropagation();
    setEditWallet(wallet);
    setEditedName(wallet.name || "");
    setShowEditModal(true);
  };

  // Close edit name modal
  const handleCloseEditModal = () => {
    setShowEditModal(false);
    setEditWallet(null);
    setEditedName("");
  };

  // Save wallet name
  const handleSaveWalletName = async () => {
    if (!editWallet) return;

    // If name hasn't changed, just close the modal
    if ((editWallet.name || "") === editedName.trim()) {
      handleCloseEditModal();
      return;
    }

    setSavingName(true);
    const newName = editedName.trim();

    // Optimistically update the UI
    setOptimisticWallets((prevWallets) =>
      prevWallets.map((w) => {
        if (w.address === editWallet.address && w.chain === editWallet.chain) {
          return { ...w, name: newName };
        }
        return w;
      })
    );

    // Close modal before actual API call
    setShowEditModal(false);
    toast.info("Updating wallet name...", { duration: 2000 });

    try {
      const result = await updateWalletName({
        address: editWallet.address,
        chain: editWallet.chain,
        name: newName,
      });

      if (result.success) {
        toast.success("Wallet name updated successfully");
      } else {
        // Revert optimistic update if failed
        setOptimisticWallets(wallets);
        toast.error("Failed to update wallet name");
      }
    } catch (error) {
      // Revert optimistic update if error
      setOptimisticWallets(wallets);
      toast.error("An error occurred while updating the wallet name");
    } finally {
      setSavingName(false);
    }
  };

  const handleShowMore = useCallback(() => {
    setVisibleCount((prev) => prev + 10);
  }, []);

  const handleViewWallet = (wallet) => {
    window.location.href = `/dashboard/wallet/${wallet.chain}/${wallet.address}`;
  };

  const handleDelete = (wallet, e) => {
    if (e) e.stopPropagation();
    onDeleteClick(wallet);
  };

  return (
    <div
      className="wallet-list-container"
      role="region"
      aria-label="Wallet holdings"
    >
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
              Showing {Math.min(visibleWallets.length, filteredWallets.length)}{" "}
              of {filteredWallets.length} wallets
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedChain !== "all" && ` on ${selectedChain.toUpperCase()}`}
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

      <div className="wallet-cards-grid">
        {visibleWallets.length > 0 ? (
          visibleWallets.map((wallet, index) => {
            const walletId = getWalletId(wallet);

            return (
              <div
                key={walletId}
                className="wallet-card"
                onClick={() => handleViewWallet(wallet)}
              >
                <div className="wallet-card-header">
                  <span className={`chain-badge ${wallet.chain.toLowerCase()}`}>
                    {wallet.chain.toUpperCase()}
                  </span>

                  <div className="wallet-name-display">
                    <span className="wallet-name">
                      {wallet.name ||
                        `${wallet.chain.toUpperCase()} Wallet ${index + 1}`}
                    </span>
                    <button
                      className="edit-name-button"
                      onClick={(e) => handleEditNameClick(wallet, e)}
                      aria-label="Edit wallet name"
                      title="Edit name"
                    >
                      <FaPencilAlt />
                    </button>
                  </div>
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
                      onClick={(e) => handleDelete(wallet, e)}
                      aria-label={`Remove ${wallet.chain} wallet`}
                      title="Remove wallet"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </div>
            );
          })
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

      {visibleCount < filteredWallets.length && (
        <button onClick={handleShowMore} className="show-more-button">
          Show more wallets ({visibleCount} of {filteredWallets.length})
        </button>
      )}

      {/* Edit Name Modal */}
      {showEditModal && editWallet && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Edit Wallet Name</h3>
              <button
                className="modal-close"
                onClick={handleCloseEditModal}
                disabled={savingName}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Enter a new name for this wallet:</p>
              <div className="wallet-info">
                <div className="wallet-info-chain">
                  {editWallet.chain.toUpperCase()}
                </div>
                <div className="wallet-info-address">{editWallet.address}</div>
              </div>

              <div className="edit-name-form">
                <div className="form-group">
                  <label htmlFor="wallet-name">Wallet Name</label>
                  <div className="input-wrapper">
                    <FaTag className="input-icon" />
                    <input
                      id="wallet-name"
                      type="text"
                      value={editedName}
                      onChange={(e) => setEditedName(e.target.value)}
                      placeholder="Enter wallet name"
                      className="form-input with-icon"
                      maxLength={30}
                      autoFocus
                    />
                  </div>
                  <p className="form-hint">
                    A custom name helps you identify this wallet easily.
                  </p>
                </div>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button cancel"
                onClick={handleCloseEditModal}
                disabled={savingName}
              >
                Cancel
              </button>
              <button
                className="modal-button save"
                onClick={handleSaveWalletName}
                disabled={savingName || !editedName.trim()}
              >
                {savingName ? (
                  <>
                    <span className="button-spinner spinning-icon"></span>
                    Saving...
                  </>
                ) : (
                  <>
                    <FaSave /> Save
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
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
