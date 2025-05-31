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
        {/* Wallets List */}
        {isLoading || refreshing ? (
          <div className="wallet-loading">
            <img
              src="/assets/logo.svg"
              alt="Loading"
              className="loading-logo pulse"
              width="50"
              height="42"
            />
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
            <h3>No Wallets Found</h3>
            <div className="paragraps">
              <p>You haven't added any wallets yet.</p>
              <p>Add a wallet to get started.</p>
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
