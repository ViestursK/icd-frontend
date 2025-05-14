import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaWallet, FaCoins, FaTrashAlt, FaTimes, FaSync } from "react-icons/fa";
import Header from "../components/ui/Header";
import BalanceCard from "../components/BalanceCard";
import WalletForm from "../components/WalletForm";
import WalletTable from "../components/WalletTable";
import AssetTable from "../components/AssetTable";
import WalletSelector from "../components/WalletSelector";
import ViewIndicator from "../components/ui/ViewIndicator";
import RefreshButton from "../components/ui/RefreshButton";
import TabSelector from "../components/TabSelector";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import StatsCard from "../components/StatsCard";
import { walletService } from "../services/walletService";
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
    clearError,
  } = useWallet();

  const toast = useToast();
  const navigate = useNavigate();
  const { chain, address } = useParams();

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
  // State for single wallet view
  const [currentWallet, setCurrentWallet] = useState(null);
  const [walletAssets, setWalletAssets] = useState([]);
  const [loadingWallet, setLoadingWallet] = useState(false);

  // Load single wallet data if chain and address are provided
  useEffect(() => {
    const loadWalletData = async () => {
      if (chain && address) {
        setLoadingWallet(true);
        try {
          // Find the wallet in the wallets list
          const wallet = wallets.find(
            (w) =>
              w.chain.toLowerCase() === chain.toLowerCase() &&
              w.address.toLowerCase() === address.toLowerCase()
          );

          if (wallet) {
            setCurrentWallet(wallet);

            // Fetch wallet tokens
            const walletData = await walletService.getWalletDetail(
              address,
              chain
            );
            const transformedAssets =
              walletService.transformWalletTokensToAssets(walletData.tokens);
            setWalletAssets(transformedAssets);
          } else {
            toast.error("Wallet not found");
            navigate("/dashboard");
          }
        } catch (error) {
          toast.error("Failed to load wallet data");
          console.error("Error loading wallet data:", error);
          navigate("/dashboard");
        } finally {
          setLoadingWallet(false);
        }
      } else {
        // Reset to all wallets view
        setCurrentWallet(null);
        setWalletAssets([]);
      }
    };

    if (wallets.length > 0) {
      loadWalletData();
    }
  }, [chain, address, wallets, navigate, toast]);

  // Calculate portfolio statistics for the stats badges
  const portfolioStats = useMemo(() => {
    // Determine which assets to use based on view
    const activeAssets = currentWallet ? walletAssets : assets;

    // Count of wallets and assets
    const walletCount = currentWallet ? 1 : wallets.length;
    const assetCount = activeAssets.length;

    // Find the most valuable asset
    const topAsset =
      activeAssets.length > 0
        ? activeAssets.sort(
            (a, b) => parseFloat(b.total_value) - parseFloat(a.total_value)
          )[0]
        : null;

    // Find the asset with the biggest price impact (positive or negative)
    const biggestImpact =
      activeAssets.length > 0
        ? activeAssets.sort((a, b) => {
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
      }, [wallets, assets, currentWallet, walletAssets]);
      
      // Handle refresh button click
      const handleRefresh = async () => {
        setRefreshing(true);
        try {
          if (currentWallet) {
            // Refresh single wallet
            try {
              const walletData = await walletService.getWalletDetail(
                address,
                chain
              );
              const transformedAssets = walletService.transformWalletTokensToAssets(
                walletData.tokens
              );
              setWalletAssets(transformedAssets);
              toast.success(
                `Wallet ${currentWallet.address.substring(0, 6)}... refreshed`
              );
            } catch (error) {
              toast.error("Failed to refresh wallet data");
            }
          } else {
            // Refresh all wallets
            const result = await refreshData();
            if (result.success) {
              toast.success("Portfolio data refreshed");
            } else if (result.error) {
              toast.error(result.error);
            }
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
          
          // If we deleted the current wallet, go back to all wallets view
          if (
            currentWallet &&
            currentWallet.address === selectedWallet.address &&
            currentWallet.chain === selectedWallet.chain
          ) {
            navigate("/dashboard");
          }
        } catch (error) {
          toast.error("Failed to remove wallet. Please try again.");
        } finally {
          setRefreshing(false);
        }
      };
      
      // Handle wallet selection from dropdown
      const handleWalletSelect = (wallet) => {
        if (wallet) {
          // Navigate to specific wallet view
          navigate(`/dashboard/wallet/${wallet.chain}/${wallet.address}`);
        } else {
          // Navigate to all wallets view
          navigate("/dashboard");
        }
      };
      
      // Function to render the active table based on tab
      const renderActiveTable = () => {
    // Combined loading state - either global loading or local refreshing or loading wallet
    const tableLoading = isLoading || refreshing || loadingWallet;
    
    switch (activeTab) {
      case "assets":
        return (
          <AssetTable
          assets={currentWallet ? walletAssets : assets}
          isLoading={tableLoading}
          visibleCount={visibleCount}
          setVisibleCount={setVisibleCount}
          />
        );
        case "wallets":
          default:
            return (
              <WalletTable
              wallets={currentWallet ? [currentWallet] : wallets}
              isLoading={tableLoading}
              onDeleteClick={handleDeleteClick}
              />
            );
          }
        };
        
        // Get the title based on active tab and current view
        const getTableTitle = () => {
          const prefix = currentWallet
          ? `${currentWallet.chain.toUpperCase()} Wallet`
          : "";
          
          switch (activeTab) {
            case "assets":
              return prefix ? `${prefix} Assets` : "Crypto Assets";
              case "wallets":
                default:
                  return prefix ? prefix : "Crypto Wallets";
                }
              };
              
              // Get balance and change percent for current view
              const getCurrentBalance = () => {
                if (currentWallet) {
                  return currentWallet.balance_usd;
                }
                return totalBalance;
              };
              
              const getCurrentChangePercent = () => {
                if (currentWallet) {
                  // Calculate change percent for wallet assets
                  const totalValue = walletAssets.reduce(
                    (sum, asset) => sum + parseFloat(asset.total_value || 0),
                    0
                  );
                  
                  const totalChange = walletAssets.reduce(
                    (sum, asset) => sum + parseFloat(asset.total_value_24h_change || 0),
                    0
                  );
                  
                  if (totalValue === 0) return "0.00";
                  
                  // Calculate percentage change relative to current value
                  const percentChange = (totalChange / (totalValue - totalChange)) * 100;
                  return percentChange.toFixed(2);
                }
                return changePercent;
              };
              
              // Create header actions with the wallet selector
              const headerActions = (
                <WalletSelector
                wallets={wallets}
                selectedWallet={currentWallet}
                onWalletSelect={handleWalletSelect}
                />
              );
              
  return (
    <div className="dashboard-container">
      <div className="top-container">
        <Header
          title="DASHBOARD"
          actions={wallets.length > 0 ? headerActions : null}
        />
      </div>
        <WalletForm />

      {/* View Indicator */}
      {wallets.length > 0 && <ViewIndicator currentWallet={currentWallet} />}

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
            balance={getCurrentBalance()}
            changePercent={getCurrentChangePercent()}
            isLoading={isLoading || refreshing || loadingWallet}
          />
          <StatsCard
            stats={portfolioStats}
            isLoading={isLoading || refreshing || loadingWallet}
          />
        </div>

        <div className="holdings-container">
          <div className="holdings-header">
            <h3>{getTableTitle()}</h3>
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={isLoading || refreshing || loadingWallet}
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
