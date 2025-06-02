import { useState } from "react";
import { FaWallet, FaTimes, FaTrashAlt } from "react-icons/fa";
import Header from "../components/ui/Header";
import WalletForm from "../components/WalletForm";
import WalletList from "../components/WalletList";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import "./WalletManagement.css";

function WalletManagement() {
  const { wallets, isLoading, error, removeWallet, clearError } = useWallet();
  const toast = useToast();

  // State
  const [selectedWallet, setSelectedWallet] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

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
      const result = await removeWallet({
        address: selectedWallet.address,
        chain: selectedWallet.chain,
      });

      if (result.success) {
        toast.success("Wallet removed successfully");
      } else {
        toast.error(result.error || "Failed to remove wallet");
      }
    } catch (error) {
      toast.error("Failed to remove wallet");
    } finally {
      setRefreshing(false);
      // Close modal after operation completes (success or failure)
      setShowDeleteModal(false);
      setSelectedWallet(null);
    }
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

      <div className="wallet-container">
        <div className="wallets-header">
          <FaWallet className="wallet-icon" />
          <h2>Wallets</h2>
        </div>
        {/* Wallets List */}
        {isLoading || refreshing ? (
          <div className="shimmer-loading"></div>
        ) : wallets.length > 0 ? (
          <WalletList
            wallets={wallets}
            isLoading={isLoading}
            onDeleteClick={handleDeleteClick}
          />
        ) : (
          <div className="empty-state-container">
            <div className="empty-state">
              <FaWallet className="empty-state-icon" size={48} />
              <p className="empty-state-text">No wallets found</p>
            </div>
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
                    <img
                      src="/assets/logo.svg"
                      alt="Loading"
                      className="pulse"
                      width="16"
                      height="14"
                      style={{ marginRight: "0.5rem" }}
                    />
                    Removing...
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
