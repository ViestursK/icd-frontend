import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  FaWallet,
  FaTimes,
  FaSync,
  FaTrashAlt,
  FaPencilAlt,
  FaCheck,
} from "react-icons/fa";
import Header from "../components/ui/Header";
import WalletForm from "../components/WalletForm";
import WalletList from "../components/WalletList";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import "./WalletManagement.css";

function WalletManagement() {
  const {
    wallets,
    isLoading,
    error,
    refreshData,
    removeWallet,
    updateWalletName,
    clearError,
  } = useWallet();
  const navigate = useNavigate();
  const toast = useToast();

  // State
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editWalletId, setEditWalletId] = useState(null);
  const [editName, setEditName] = useState("");
  const [refreshing, setRefreshing] = useState(false);

  // Format wallet address
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.substring(0, 6)}...${address.substring(
      address.length - 4
    )}`;
  };

  // Handle refresh
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await refreshData();
      if (result.success) {
        toast.success("Wallet data refreshed");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to refresh data");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle delete click
  const handleDeleteClick = (wallet) => {
    setSelectedWallet(wallet);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedWallet) return;

    setRefreshing(true);
    try {
      await removeWallet({
        address: selectedWallet.address,
        chain: selectedWallet.chain,
      });
      toast.success("Wallet removed successfully");
      setShowDeleteModal(false);
      setSelectedWallet(null);
    } catch (error) {
      toast.error("Failed to remove wallet");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle edit name click
  const handleEditNameClick = (wallet) => {
    setEditWalletId(`${wallet.chain}-${wallet.address}`);
    setEditName(wallet.name || "");
  };

  // Handle save name
  const handleSaveName = async (wallet) => {
    setRefreshing(true);
    try {
      const result = await updateWalletName({
        address: wallet.address,
        chain: wallet.chain,
        name: editName.trim(),
      });

      if (result.success) {
        toast.success("Wallet name updated");
        setEditWalletId(null);
        setEditName("");
      } else {
        toast.error(result.error || "Failed to update name");
      }
    } catch (error) {
      toast.error("Failed to update wallet name");
    } finally {
      setRefreshing(false);
    }
  };

  // Handle view wallet
  const handleViewWallet = (wallet) => {
    navigate(`/dashboard/wallet/${wallet.chain}/${wallet.address}`);
  };

  return (
    <div className="dashboard-container">
      <div className="top-container">
        <Header
          title="WALLET MANAGEMENT"
          actions={
            <div className="header-actions-container">
              <WalletForm />
            </div>
          }
        />
      </div>

      {error && (
        <div className="error-alert" role="alert">
          <p>{error}</p>
          <button onClick={clearError} className="dismiss-error">
            ✕
          </button>
        </div>
      )}

      <div className="container">
        {/* Wallets List */}
        {isLoading || refreshing ? (
          <div className="wallet-loading">
            <div className="loading-spinner"></div>
            <p>Loading wallets...</p>
          </div>
        ) : wallets.length > 0 ? (
          <WalletList
            wallets={wallets}
            isLoading={isLoading}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <div className="empty-state">
            <FaWallet className="empty-icon" />
            <h3>No Wallets Found</h3>
            <p>
              You haven't added any wallets yet. Add a wallet to get started.
            </p>
          </div>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && selectedWallet && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Remove Wallet</h3>
              <button
                className="modal-close"
                onClick={() => setShowDeleteModal(false)}
              >
                <FaTimes />
              </button>
            </div>
            <div className="modal-body">
              <p>Are you sure you want to remove this wallet?</p>
              <div className="wallet-info">
                <div className="wallet-info-chain">
                  {selectedWallet.chain.toUpperCase()}
                </div>
                <div className="wallet-info-address">
                  {selectedWallet.address}
                </div>
                {selectedWallet.name && (
                  <div className="wallet-info-name">{selectedWallet.name}</div>
                )}
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="modal-button cancel"
                onClick={() => setShowDeleteModal(false)}
                disabled={refreshing}
              >
                Cancel
              </button>
              <button
                className="modal-button delete"
                onClick={handleConfirmDelete}
                disabled={refreshing}
              >
                {refreshing ? (
                  <>
                    <FaSync className="spin" /> Removing...
                  </>
                ) : (
                  <>
                    <FaTrashAlt /> Remove
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default WalletManagement;
