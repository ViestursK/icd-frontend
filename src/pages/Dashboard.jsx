// Import existing components and hooks
import React, { useState, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { FaCoins, FaWallet } from "react-icons/fa";
import Header from "../components/ui/Header";
import BalanceCard from "../components/BalanceCard";
import WalletForm from "../components/WalletForm";
import AssetTable from "../components/AssetTable";
import WalletSelector from "../components/WalletSelector";
import RefreshButton from "../components/ui/RefreshButton";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import StatsCard from "../components/StatsCard";
import AssetAllocationChart from "../components/AssetAllocationChart";
import { walletService } from "../services/walletService";
import "./Dashboard.css";

// Define tab options - removed wallets tab, now just assets
const TABS = [{ id: "assets", label: "Assets", icon: <FaCoins /> }];

function Dashboard() {
  const {
    wallets,
    assets,
    totalBalance,
    changePercent,
    isLoading,
    error,
    refreshData,
    clearError,
  } = useWallet();

  const toast = useToast();
  const navigate = useNavigate();
  const { chain, address } = useParams();

  // State for active tab - now defaults to assets since it's the only option
  const [activeTab, setActiveTab] = useState("assets");
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

  // Prepare data for asset allocation chart
  const chartData = useMemo(() => {
    const dataToUse = currentWallet ? walletAssets : assets;
    return dataToUse.map((asset) => ({
      name: asset.symbol,
      value: parseFloat(asset.total_value || 0),
    }));
  }, [assets, walletAssets, currentWallet]);

  // Determine which assets to display
  const activeAssets = currentWallet ? walletAssets : assets;

  return (
    <div className="dashboard-container">
      <div className="top-container">
        <Header
          title="DASHBOARD"
          actions={
            wallets.length > 0 ? (
              <div className="header-actions-container">
                <WalletSelector
                  wallets={wallets}
                  selectedWallet={currentWallet}
                  onWalletSelect={handleWalletSelect}
                />
                <WalletForm />
              </div>
            ) : null
          }
        />

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
        {/* Balance and Stats - Left side */}
        <div className="dashboard-column main-column">
          <div className="balance-stats-wrapper">
            <div className="card-wrapper">
              <BalanceCard
                balance={getCurrentBalance()}
                changePercent={getCurrentChangePercent()}
                isLoading={isLoading || refreshing || loadingWallet}
              />
            </div>
            <div className="card-wrapper">
              <StatsCard
                stats={portfolioStats}
                isLoading={isLoading || refreshing || loadingWallet}
              />
            </div>
            <div className="card-wrapper">
              <AssetAllocationChart
                data={chartData}
                title="Asset Allocation"
                valueKey="value"
                nameKey="name"
                loading={isLoading || refreshing || loadingWallet}
                othersThreshold={2}
              />
            </div>
          </div>

          <div className="holdings-container">
            <div className="holdings-header">
              <h3>Crypto Assets</h3>
              <div className="holdings-actions">
                <RefreshButton
                  onRefresh={handleRefresh}
                  isLoading={isLoading || refreshing || loadingWallet}
                  label={refreshing ? "Refreshing..." : "Refresh"}
                  aria-label="Refresh portfolio data"
                  variant="secondary"
                  size="small"
                  showLabel={true}
                />
                {wallets.length > 0 && (
                  <button
                    className="manage-wallets-button"
                    onClick={() => navigate("/dashboard/wallets")}
                  >
                    <FaWallet style={{ marginRight: "0.5rem" }} />
                    Manage Wallets
                  </button>
                )}
              </div>
            </div>

            <AssetTable
              assets={activeAssets}
              isLoading={isLoading || refreshing || loadingWallet}
              visibleCount={visibleCount}
              setVisibleCount={setVisibleCount}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
