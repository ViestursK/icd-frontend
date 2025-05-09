// src/context/WalletContext.jsx - Improved version

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { walletService } from "../services/walletService";
import { useAuth } from "./AuthContext";
import { useToast } from "./ToastContext";

// Create wallet context
const WalletContext = createContext(null);

// Wallet provider component
export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();
  const toast = useToast();

  // State for different data types
  const [wallets, setWallets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [changePercent, setChangePercent] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supportedChains, setSupportedChains] = useState([]);
  const [loadingChains, setLoadingChains] = useState(false);
  const [lastUpdated, setLastUpdated] = useState(null);

  // Load wallets and assets on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallets();
      fetchAssets();
      fetchSupportedChains();
    } else {
      // Reset state when not authenticated
      setWallets([]);
      setAssets([]);
      setTotalBalance("0.00");
      setChangePercent("0.00");
      setSupportedChains([]);
      setLastUpdated(null);
    }
  }, [isAuthenticated]);

  // Fetch wallets from API or cache
  const fetchWallets = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const walletsData = await walletService.fetchWallets(forceRefresh);
        setWallets(walletsData || []);
        setLastUpdated(new Date());

        return walletsData;
      } catch (err) {
        // Only set error if it's not a case of a new user with no wallets
        // New users will just see empty wallet tables, not an error message
        if (err.response?.status !== 404) {
          const errorMessage =
            err.response?.data?.detail || "Failed to load wallet data.";
          setError(errorMessage);
          console.error("Error fetching wallets:", err);
        }
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Fetch assets from API or cache
  const fetchAssets = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const assetsData = await walletService.fetchAssets(forceRefresh);

        // Make sure we have valid data
        if (Array.isArray(assetsData)) {
          setAssets(assetsData);

          // Calculate and update total balance from assets
          const calculatedBalance =
            walletService.calculateTotalBalance(assetsData);
          setTotalBalance(calculatedBalance);

          // Calculate and update 24h change percentage
          const calculatedChangePercent =
            walletService.calculate24hChangePercent(assetsData);
          setChangePercent(calculatedChangePercent);

          setLastUpdated(new Date());

          return assetsData;
        }
        return [];
      } catch (err) {
        // Only set error if it's not a case of a new user with no assets
        if (err.response?.status !== 404) {
          const errorMessage =
            err.response?.data?.detail || "Failed to load asset data.";
          setError(errorMessage);
          console.error("Error fetching assets:", err);
        }
        return [];
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Fetch supported blockchain chains
  const fetchSupportedChains = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated) return;

      setLoadingChains(true);

      try {
        const chains = await walletService.getSupportedChains(forceRefresh);
        setSupportedChains(chains || []);
        return chains;
      } catch (err) {
        console.error("Error fetching supported chains:", err);
        // Don't set global error for this as it's not critical
        return [];
      } finally {
        setLoadingChains(false);
      }
    },
    [isAuthenticated]
  );

  // Add a new wallet
  const addWallet = useCallback(
    async (walletData) => {
      if (!isAuthenticated)
        return { success: false, error: "Not authenticated" };

      setIsLoading(true);
      setError(null);

      try {
        const newWallet = await walletService.addWallet(walletData);

        // Refresh data after adding wallet with forced refresh
        await fetchWallets(true);
        const newAssets = await fetchAssets(true);

        toast.success(`Wallet added successfully!`);

        return { success: true, wallet: newWallet, assets: newAssets };
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail || "Failed to add wallet.";
        setError(errorMessage);
        console.error("Error adding wallet:", err);

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, fetchWallets, fetchAssets, toast]
  );

  // Remove wallet
  const removeWallet = useCallback(
    async (walletData) => {
      if (!isAuthenticated)
        return { success: false, error: "Not authenticated" };

      setIsLoading(true);
      setError(null);

      try {
        const result = await walletService.removeWallet(walletData);

        // Refresh data after removing wallet with forced refresh
        await fetchWallets(true);
        const newAssets = await fetchAssets(true);

        toast.success(`Wallet removed successfully!`);

        return { success: true, result, assets: newAssets };
      } catch (err) {
        const errorMessage =
          err.response?.data?.detail || "Failed to remove wallet.";
        setError(errorMessage);
        console.error("Error removing wallet:", err);

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, fetchWallets, fetchAssets, toast]
  );

  // Handle refresh button click
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Refresh both wallets and assets
      await fetchWallets(true);
      const newAssets = await fetchAssets(true);

      toast.success("Portfolio data refreshed successfully!");

      return { success: true, assets: newAssets };
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to refresh data.";
      setError(errorMessage);
      toast.error(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchWallets, fetchAssets, toast]);

  // Provide context value
  const contextValue = {
    wallets,
    assets,
    totalBalance,
    setTotalBalance,
    changePercent,
    setChangePercent,
    isLoading,
    error,
    supportedChains,
    loadingChains,
    lastUpdated,
    fetchWallets,
    fetchAssets,
    addWallet,
    removeWallet,
    refreshData,
    fetchSupportedChains,
    clearError: () => setError(null),
  };

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};

// Hook to use wallet context
export const useWallet = () => {
  const context = useContext(WalletContext);

  if (!context) {
    throw new Error("useWallet must be used within a WalletProvider");
  }

  return context;
};

export default WalletContext;
