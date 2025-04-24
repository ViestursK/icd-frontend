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
<<<<<<< HEAD
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [changePercent, setChangePercent] = useState("0.00");
=======
  const [exchanges, setExchanges] = useState([]);
  const [totalBalance, setTotalBalance] = useState("0.00");
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supportedChains, setSupportedChains] = useState([]);
  const [loadingChains, setLoadingChains] = useState(false);

<<<<<<< HEAD
  // Load wallets and assets on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallets();
      fetchAssets();
=======
  // Load wallets on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallets();
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
      fetchSupportedChains();
    } else {
      // Reset state when not authenticated
      setWallets([]);
      setAssets([]);
<<<<<<< HEAD
      setTotalBalance("0.00");
      setChangePercent("0.00");
=======
      setExchanges([]);
      setTotalBalance("0.00");
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
      setSupportedChains([]);
    }
  }, [isAuthenticated]);

<<<<<<< HEAD
=======
  // Update total balance when wallets or exchanges change
  useEffect(() => {
    const walletsBalance = walletService.calculateTotalBalance(wallets);
    const exchangesBalance = exchanges.reduce((total, exchange) => {
      return total + parseFloat(exchange.balance_usd || 0);
    }, 0);
    
    const total = parseFloat(walletsBalance) + exchangesBalance;
    setTotalBalance(total.toFixed(2));
  }, [wallets, exchanges]);

>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
  // Fetch wallets from API or cache
  const fetchWallets = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const walletsData = await walletService.fetchWallets(forceRefresh);
        setWallets(walletsData || []);
        
<<<<<<< HEAD
        // Note: We'll calculate total balance from assets now, as it's more reliable
      } catch (err) {
        // Only set error if it's not a case of a new user with no wallets
        // New users will just see empty wallet tables, not an error message
        if (err.response?.status !== 404) {
          const errorMessage = err.response?.data?.detail || "Failed to load wallet data.";
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
        const calculatedBalance = walletService.calculateTotalBalance(assetsData);
        setTotalBalance(calculatedBalance);
        
        // Calculate and update 24h change percentage
        const calculatedChangePercent = walletService.calculate24hChangePercent(assetsData);
        setChangePercent(calculatedChangePercent);
      } catch (err) {
        // Only set error if it's not a case of a new user with no assets
        if (err.response?.status !== 404) {
          const errorMessage = err.response?.data?.detail || "Failed to load asset data.";
          setError(errorMessage);
          console.error("Error fetching assets:", err);
        }
=======
        // In a real implementation, you'd also fetch assets and exchanges here
        // For now, we'll use mock data in the Dashboard component
        
        console.log("Fetched wallets:", walletsData);
      } catch (err) {
        setError("Failed to load portfolio data. Please try again.");
        console.error("Error fetching data:", err);
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
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
<<<<<<< HEAD
        // Don't set global error for this as it's not critical
=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
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
        const newWallet = await walletService.addWallet(walletData);

<<<<<<< HEAD
        // Refresh data after adding wallet
        await fetchWallets(true);
        await fetchAssets(true);

        // Don't use toast here
=======
        // Refresh wallets to include the new one
        await fetchWallets(true);

>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
        return { success: true, wallet: newWallet };
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
<<<<<<< HEAD
    [isAuthenticated, fetchWallets, fetchAssets]
  );

  // Remove wallet
  const removeWallet = useCallback(
    async (walletData) => {
=======
    [isAuthenticated, fetchWallets]
  );

  // Add exchange account (placeholder for future implementation)
  const addExchange = useCallback(
    async (exchangeData) => {
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
<<<<<<< HEAD
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
=======
        // This would be implemented with an actual API endpoint
        console.log("Adding exchange:", exchangeData);
        
        // Simulate success response
        return { success: true };
      } catch (err) {
        const errorMessage = "Failed to add exchange.";
        setError(errorMessage);
        console.error("Error adding exchange:", err);
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
<<<<<<< HEAD
    [isAuthenticated, fetchWallets, fetchAssets]
  );

  // Handle refresh button click
  const refreshData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Refresh both wallets and assets
      await Promise.all([
        fetchWallets(true),
        fetchAssets(true)
      ]);
      
      // Don't use toast here
      return { success: true };
    } catch (err) {
      const errorMessage = err.response?.data?.detail || "Failed to refresh data.";
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  }, [fetchWallets, fetchAssets]);

=======
    [isAuthenticated]
  );

>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
  // Provide context value
  const contextValue = {
    wallets,
    assets,
<<<<<<< HEAD
    totalBalance,
    changePercent,
=======
    exchanges,
    totalBalance,
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
    isLoading,
    error,
    supportedChains,
    loadingChains,
    fetchWallets,
<<<<<<< HEAD
    fetchAssets,
    addWallet,
    removeWallet,
    refreshData,
=======
    addWallet,
    addExchange,
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
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