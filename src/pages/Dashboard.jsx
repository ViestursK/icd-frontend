import React, { useState, useMemo } from "react";
import { FaWallet, FaCoins, FaTrashAlt, FaTimes, FaSync, FaChartLine } from "react-icons/fa";
import Header from "../components/ui/Header";
import BalanceCard from "../components/BalanceCard";
import WalletForm from "../components/WalletForm";
import WalletTable from "../components/WalletTable";
import AssetTable from "../components/AssetTable";
import RefreshButton from "../components/ui/RefreshButton";
import TabSelector from "../components/TabSelector";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import StatsCard from "../components/StatsCard";
import PriceDashboard from "../components/PriceDashboard";

import "./Dashboard.css";

// Define tab options
const TABS = [
  { id: "assets", label: "Assets", icon: <FaCoins /> },
  { id: "wallets", label: "Wallets", icon: <FaWallet /> },
  { id: "prices", label: "Live Prices", icon: <FaChartLine /> },
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
    clearError,
  } = useWallet();

  const toast = useToast();

  // State for active tab
  const [activeTab, setActiveTab] = useState("assets");
  // State for wallet being deleted
  const [selectedWallet, setSelectedWallet] = useState(null);
  // State for delete confirmation modal
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  // State for refresh operation
  const [refreshing, setRefreshing] = useState(false);
  // State for visible assets count (default to 20 for better initial density)
  const [visibleCount, setVisibleCount] = useState(20);

  // Calculate portfolio statistics for the stats badges
  const portfolioStats = useMemo(() => {
    // Count of wallets and assets
    const walletCount = wallets.length;
    const assetCount = assets.length;

    // Find the most valuable asset
    const topAsset =
      assets.length > 0
        ? assets.sort(
            (a, b) => parseFloat(b.total_value) - parseFloat(a.total_value)
          )[0]
        : null;

    // Find the asset with the biggest price impact (positive or negative)
    const biggestImpact =
      assets.length > 0
        ? assets.sort((a, b) => {
            return (
              Math.abs(parseFloat(b.price_24h_change_percent)) -
              Math.abs(parseFloat(a.price_24h_change_percent))
            );
          })[0]
        : null;

    return {
      walletCount,
      assetCount,
      topAsset: topAsset
        ? { symbol: topAsset.symbol, value: topAsset.total_value }
        : { symbol: "N/A", value: "0" },
      biggestImpact: biggestImpact
        ? {
            symbol: biggestImpact.symbol,
            value: biggestImpact.total_value,
            change: biggestImpact.price_24h_change_percent,
          }
        : { symbol: "N/A", value: "0", change: "0" },
    };
  }, [wallets, assets]);

  // Handle refresh button click
  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      const result = await refreshData();
      if (result.success) {
        toast.success("Portfolio data refreshed");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to refresh data. Please try again.");
    } finally {
      setRefreshing(false);
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

    try {
      setRefreshing(true);
      const result = await removeWallet({
        address: selectedWallet.address,
        chain: selectedWallet.chain,
      });

      toast.success("Wallet removed successfully!");
      setShowDeleteModal(false);
      setSelectedWallet(null);
    } catch (error) {
      toast.error("Failed to remove wallet. Please try again.");
    } finally {
      setRefreshing(false);
    }
  };

  // Function to render the active table based on tab
  const renderActiveTable = () => {
    // Combined loading state - either global loading or local refreshing
    const tableLoading = isLoading || refreshing;

    switch (activeTab) {
      case "assets":
        return (
          <AssetTable
            assets={assets}
            isLoading={tableLoading}
            visibleCount={visibleCount}
            setVisibleCount={setVisibleCount}
          />
        );
      case "wallets":
        return (
          <WalletTable
            wallets={wallets}
            isLoading={tableLoading}
            onDeleteClick={handleDeleteClick}
          />
        );
      case "prices": // Add this case
        return <PriceDashboard />; // Add this line
      default:
        return (
          <WalletTable
            wallets={wallets}
            isLoading={tableLoading}
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

      <div className="container">
        <div className="balance-stats-wrapper">
          <BalanceCard
            balance={totalBalance}
            changePercent={changePercent}
            isLoading={isLoading || refreshing}
          />
          <StatsCard
            stats={portfolioStats}
            isLoading={isLoading || refreshing}
          />
        </div>

        <div className="holdings-container">
          <div className="holdings-header">
            <h3>{getTableTitle()}</h3>
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={isLoading || refreshing}
              label={refreshing ? "Refreshing..." : "Refresh"}
              aria-label="Refresh portfolio data"
              variant="secondary"
              size="small"
              showLabel={true}
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
                disabled={refreshing}
              >
                <FaTimes />
              </button>
            </div>

            <div className="modal-content">
              <p>Are you sure you want to remove this wallet?</p>
              <div className="wallet-preview">
                <div className="wallet-chain">
                  <span
                    className={`chain-badge ${selectedWallet.chain.toLowerCase()}`}
                  >
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
                disabled={refreshing}
              >
                Cancel
              </button>
              <button
                className="modal-delete-button"
                onClick={handleConfirmDelete}
                disabled={refreshing}
              >
                {refreshing ? (
                  <FaSync className="button-spinner" />
                ) : (
                  <FaTrashAlt />
                )}
                {refreshing ? " Removing..." : " Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;
