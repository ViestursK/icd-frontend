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

  // State for wallets and loading status
  const [wallets, setWallets] = useState([]);
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
      setTotalBalance("0.00");
      setSupportedChains([]);
    }
  }, [isAuthenticated]);

  // Update total balance when wallets change
  useEffect(() => {
    setTotalBalance(walletService.calculateTotalBalance(wallets));
  }, [wallets]);

  // Fetch wallets from API or cache
  const fetchWallets = useCallback(
    async (forceRefresh = false) => {
      if (!isAuthenticated) return;

      setIsLoading(true);
      setError(null);

      try {
        const walletsData = await walletService.fetchWallets(forceRefresh);
        setWallets(walletsData || []);
        console.log("Fetched wallets:", walletsData);
      } catch (err) {
        setError("Failed to load wallets. Please try again.");
        console.error("Error fetching wallets:", err);
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

  // Provide context value
  const contextValue = {
    wallets,
    totalBalance,
    isLoading,
    error,
    supportedChains,
    loadingChains,
    fetchWallets,
    addWallet,
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
