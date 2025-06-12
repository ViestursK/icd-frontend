import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { walletService } from "../services/walletService";
import { useAuth } from "./AuthContext";

// Create wallet context
const WalletContext = createContext(null);

// Wallet provider component
export const WalletProvider = ({ children }) => {
  const { isAuthenticated } = useAuth();

  // State for different data types
  const [wallets, setWallets] = useState([]);
  const [assets, setAssets] = useState([]);
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [changePercent, setChangePercent] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supportedChains, setSupportedChains] = useState([]);
  const [loadingChains, setLoadingChains] = useState(false);

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
      } catch (err) {
        if (err.response?.status !== 404) {
          const errorMessage =
            err.response?.data?.detail || "Failed to load wallet data.";
          setError(errorMessage);
          console.error("Error fetching wallets:", err);
        }
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
        setAssets(assetsData || []);

        // Calculate and update total balance from assets
        const calculatedBalance =
          walletService.calculateTotalBalance(assetsData);
        setTotalBalance(calculatedBalance);

        // Calculate and update 24h change percentage
        const calculatedChangePercent =
          walletService.calculate24hChangePercent(assetsData);
        setChangePercent(calculatedChangePercent);
      } catch (err) {
        // Only set error if it's not a case of a new user with no assets
        if (err.response?.status !== 404) {
          const errorMessage =
            err.response?.data?.detail || "Failed to load asset data.";
          setError(errorMessage);
          console.error("Error fetching assets:", err);
        }
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
      } catch (err) {
        console.error("Error fetching supported chains:", err);
        // Don't set global error for this as it's not critical
      } finally {
        setLoadingChains(false);
      }
    },
    [isAuthenticated]
  );

  // Add a new wallet
  const addWallet = useCallback(
    async (walletData) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await walletService.addWallet(walletData);

        // Refresh data after adding wallet
        await fetchWallets(true);
        await fetchAssets(true);

        // Don't use toast here
        return { success: true, wallet: result.data };
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
    [isAuthenticated, fetchWallets, fetchAssets]
  );

  // Remove wallet
  const removeWallet = useCallback(
    async (walletData) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const result = await walletService.removeWallet(walletData);

        // Refresh data after removing wallet
        await fetchWallets(true);
        await fetchAssets(true);

        // Don't use toast here
        return { success: true, result };
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
    [isAuthenticated, fetchWallets, fetchAssets]
  );

  // Update wallet name
  const updateWalletName = useCallback(
    async (walletData) => {
      if (!isAuthenticated)
        return { success: false, error: "Not authenticated" };

      setIsLoading(true);
      setError(null);

      try {
        const result = await walletService.updateWalletName(walletData);

        if (result.success) {
          // Refresh wallets after updating name
          await fetchWallets(true);

          // Update the wallet name in the local state for immediate UI update
          setWallets((prevWallets) =>
            prevWallets.map((wallet) => {
              if (
                wallet.address === walletData.address &&
                wallet.chain === walletData.chain
              ) {
                return { ...wallet, name: walletData.name };
              }
              return wallet;
            })
          );
        }

        return result;
      } catch (err) {
        const errorMessage =
          err.response?.data?.error || "Failed to update wallet name.";
        setError(errorMessage);
        console.error("Error updating wallet name:", err);

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated, fetchWallets]
  );

  // Handle refresh button click
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Refresh both wallets and assets
      await Promise.all([fetchWallets(true), fetchAssets(true)]);

      // Don't use toast here
      return { success: true };
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to refresh data.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchWallets, fetchAssets]);

  // Provide context value
  const contextValue = {
    wallets,
    assets,
    totalBalance,
    changePercent,
    isLoading,
    error,
    supportedChains,
    loadingChains,
    fetchWallets,
    fetchAssets,
    addWallet,
    removeWallet,
    updateWalletName,
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
