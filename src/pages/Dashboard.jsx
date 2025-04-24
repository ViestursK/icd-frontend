import React, { useState, useEffect } from "react";
import { FaWallet, FaCoins, FaTrashAlt, FaTimes } from "react-icons/fa";
import Header from "../components/ui/Header";
import BalanceCard from "../components/BalanceCard";
import WalletForm from "../components/WalletForm";
import WalletTable from "../components/WalletTable";
import AssetTable from "../components/AssetTable";
import RefreshButton from "../components/ui/RefreshButton";
import TabSelector from "../components/TabSelector";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import "./Dashboard.css";

// Define tab options
const TABS = [
  { id: "assets", label: "Assets", icon: <FaCoins /> },
  { id: "wallets", label: "Wallets", icon: <FaWallet /> },
];

function Dashboard() {
  const { 
    wallets, 
    assets, 
    totalBalance, 
    changePercent, 
    isLoading, 
    error, 
    refreshData, 
    removeWallet,
    clearError 
  } = useWallet();
  
  // Use the toast hook here, in a component that's within the ToastProvider
  const toast = useToast();
    
  // State for active tab
  const [activeTab, setActiveTab] = useState("assets");
  // State for wallet being deleted
  const [selectedWallet, setSelectedWallet] = useState(null);
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Handle refresh button click
  const handleRefresh = async () => {
    const result = await refreshData();
    if (result.success) {
      toast.success("Portfolio data refreshed");
    } else if (result.error) {
      toast.error(result.error);
    }
  };

  // Handle wallet delete click
  const handleDeleteClick = (wallet) => {
    setSelectedWallet(wallet);
    setShowDeleteModal(true);
  };

  // Handle confirm delete
  const handleConfirmDelete = async () => {
    if (!selectedWallet) return;
    
    const result = await removeWallet({
      address: selectedWallet.address,
      chain: selectedWallet.chain
    });
    
    if (result.success) {
      toast.success("Wallet removed successfully!");
      setShowDeleteModal(false);
      setSelectedWallet(null);
    } else if (result.error) {
      toast.error(result.error || "Failed to remove wallet. Please try again.");
    }
  };

  // Function to render the active table based on tab
  const renderActiveTable = () => {
    switch (activeTab) {
      case "assets":
        return <AssetTable assets={assets} isLoading={isLoading} />;
      case "wallets":
      default:
        return (
          <WalletTable 
            wallets={wallets} 
            isLoading={isLoading} 
            onDeleteClick={handleDeleteClick}
          />
        );
    }
  };

  // Get the title based on active tab
  const getTableTitle = () => {
    switch (activeTab) {
      case "assets":
        return "Crypto Assets";
      case "wallets":
      default:
        return "Crypto Wallets";
    }
  };

  return (
    <div className="dashboard-container">
      <div className="top-container">
        <Header title="DASHBOARD" />
        <WalletForm />
      </div>

      {error && (
        <div className="error-alert" role="alert">
          <p>{error}</p>
          <button
            onClick={clearError}
            aria-label="Dismiss error"
            className="dismiss-error"
          >
            ✕
          </button>
        </div>
      )}

      <h2 className="section-title">Portfolio</h2>

      <div className="container">
        <div className="stat-container">
          <BalanceCard
            balance={totalBalance}
            changePercent={changePercent} 
            isLoading={isLoading}
          />
        </div>

        <div className="holdings-container">
          <div className="holdings-header">
            <h3>{getTableTitle()}</h3>
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={isLoading}
              aria-label="Refresh portfolio data"
            />
          </div>

          <TabSelector 
            tabs={TABS} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />

          {renderActiveTable()}
        </div>
      </div>
      
      {/* Delete confirmation modal */}
      {showDeleteModal && selectedWallet && (
        <div className="modal-overlay">
          <div className="modal-container">
            <div className="modal-header">
              <h3>Remove Wallet</h3>
              <button 
                className="modal-close-button"
                onClick={() => setShowDeleteModal(false)}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>
            
            <div className="modal-content">
              <p>Are you sure you want to remove this wallet?</p>
              <div className="wallet-preview">
                <div className="wallet-chain">
                  <span className={`chain-badge ${selectedWallet.chain.toLowerCase()}`}>
                    {selectedWallet.chain}
                  </span>
                </div>
                <div className="wallet-address">{selectedWallet.address}</div>
              </div>
            </div>
            
            <div className="modal-actions">
              <button 
                className="modal-cancel-button" 
                onClick={() => setShowDeleteModal(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-delete-button"
                onClick={handleConfirmDelete}
              >
                <FaTrashAlt /> Remove
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;