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
  const [exchanges, setExchanges] = useState([]);
  const [totalBalance, setTotalBalance] = useState("0.00");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [supportedChains, setSupportedChains] = useState([]);
  const [loadingChains, setLoadingChains] = useState(false);

  // Load wallets on mount if authenticated
  useEffect(() => {
    if (isAuthenticated) {
      fetchWallets();
      fetchSupportedChains();
    } else {
      // Reset state when not authenticated
      setWallets([]);
      setAssets([]);
      setExchanges([]);
      setTotalBalance("0.00");
      setSupportedChains([]);
    }
  }, [isAuthenticated]);

  // Update total balance when wallets or exchanges change
  useEffect(() => {
    const walletsBalance = walletService.calculateTotalBalance(wallets);
    const exchangesBalance = exchanges.reduce((total, exchange) => {
      return total + parseFloat(exchange.balance_usd || 0);
    }, 0);
    
    const total = parseFloat(walletsBalance) + exchangesBalance;
    setTotalBalance(total.toFixed(2));
  }, [wallets, exchanges]);

  // Fetch wallets from API or cache
  const fetchWallets = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const walletsData = await walletService.fetchWallets(forceRefresh);
        setWallets(walletsData || []);
        
        // In a real implementation, you'd also fetch assets and exchanges here
        // For now, we'll use mock data in the Dashboard component
        
        console.log("Fetched wallets:", walletsData);
      } catch (err) {
        setError("Failed to load portfolio data. Please try again.");
        console.error("Error fetching data:", err);
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

        // Refresh wallets to include the new one
        await fetchWallets(true);

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
    [isAuthenticated, fetchWallets]
  );

  // Add exchange account (placeholder for future implementation)
  const addExchange = useCallback(
    async (exchangeData) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        // This would be implemented with an actual API endpoint
        console.log("Adding exchange:", exchangeData);
        
        // Simulate success response
        return { success: true };
      } catch (err) {
        const errorMessage = "Failed to add exchange.";
        setError(errorMessage);
        console.error("Error adding exchange:", err);

        return { success: false, error: errorMessage };
      } finally {
        setIsLoading(false);
      }
    },
    [isAuthenticated]
  );

  // Provide context value
  const contextValue = {
    wallets,
    assets,
    exchanges,
    totalBalance,
    isLoading,
    error,
    supportedChains,
    loadingChains,
    fetchWallets,
    addWallet,
    addExchange,
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