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
  FaSave,
  FaUndo,
  FaTrashAlt,
  FaCopy,
  FaWallet,
} from "react-icons/fa";
import "../styles/tableUtils.css";
import "./WalletList.css";
import "./skeleton.css";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";

const WalletList = ({ wallets, isLoading, onDeleteClick }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedChain, setSelectedChain] = useState("all");
  const [visibleCount, setVisibleCount] = useState(15);
  const [editingWalletId, setEditingWalletId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [savingName, setSavingName] = useState(false);
  const [optimisticWallets, setOptimisticWallets] = useState([]);

  const editInputRef = useRef(null);
  const { updateWalletName } = useWallet();
  const toast = useToast();

  useEffect(() => {
    setOptimisticWallets(wallets);
  }, [wallets]);

  useEffect(() => {
    if (editingWalletId && editInputRef.current) {
      editInputRef.current.focus();
      editInputRef.current.select();
    }
  }, [editingWalletId]);

  // Show shimmer effect when loading
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
      button.setAttribute("data-copied", "false");
    }, 2000);
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

  const startEditingName = (wallet, e) => {
    if (e) e.stopPropagation();
    setEditingWalletId(getWalletId(wallet));
    setEditedName(wallet.name || "");
  };

  const cancelEditing = (e) => {
    if (e) e.stopPropagation();
    setEditingWalletId(null);
    setEditedName("");
  };

  const handleKeyPress = (e, wallet) => {
    if (e.key === "Enter") {
      saveWalletName(wallet, e);
    } else if (e.key === "Escape") {
      cancelEditing(e);
    }
  };

  const saveWalletName = async (wallet, e) => {
    if (e) e.stopPropagation();
    if (!wallet) return;

    if ((wallet.name || "") === editedName.trim()) {
      cancelEditing(e);
      return;
    }

    setSavingName(true);
    const newName = editedName.trim();

    setOptimisticWallets((prevWallets) =>
      prevWallets.map((w) => {
        if (w.address === wallet.address && w.chain === wallet.chain) {
          return { ...w, name: newName };
        }
        return w;
      })
    );

    setEditingWalletId(null);
    toast.info("Updating wallet name...", { duration: 2000 });

    try {
      const result = await updateWalletName({
        address: wallet.address,
        chain: wallet.chain,
        name: newName,
      });

      if (result.success) {
        toast.success("Wallet name updated successfully");
      } else {
        setOptimisticWallets(wallets);
        toast.error("Failed to update wallet name");
      }
    } catch (error) {
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
            <div className="empty-state">
              {searchQuery || selectedChain !== "all" ? (
                <>
                  <FaSearch className="empty-state-icon" size={48} />
                  <p className="empty-state-text">
                    No wallets match your search criteria
                  </p>
                </>
              ) : (
                <>
                  <FaWallet className="empty-state-icon" size={48} />
                  <p className="empty-state-text">No wallets found</p>
                </>
              )}
            </div>
          </div>
        )}
      </div>

      {visibleCount < filteredWallets.length && (
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
