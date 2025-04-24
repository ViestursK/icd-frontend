import api from "../api/api";
import { getUserIdFromToken } from "../utils/auth";

// Cache settings
const CACHE_EXPIRATION = 15 * 60 * 1000; // 15 minutes
const SUPPORTED_CHAINS_CACHE_EXPIRATION = 24 * 60 * 60 * 1000; // 24 hours

// Helper function to get wallet cache key for current user
export const getWalletsCacheKey = () => {
  const accessToken = localStorage.getItem("access_token");
  const userId = getUserIdFromToken(accessToken);
  return userId ? `wallets_${userId}` : null;
};

/**
 * Cache management functions
 */
export const cacheService = {
  set: (key, data, expiration = CACHE_EXPIRATION) => {
    if (!key) return false;
    
    localStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
    return true;
  },
  
  get: (key, defaultExpiration = CACHE_EXPIRATION) => {
    if (!key) return null;
    
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;
    
    try {
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < defaultExpiration) {
        console.log('[DEBUG] Using cached wallet data:', data);
        return data;
      }
      // Cache expired, remove it
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error parsing cached data:", error);
      localStorage.removeItem(key);
    }
    
    return null;
  },
  
  remove: (key) => {
    if (!key) return;
    localStorage.removeItem(key);
  },
  
  clearUserCache: () => {
    const walletsCacheKey = getWalletsCacheKey();
    if (walletsCacheKey) {
      localStorage.removeItem(walletsCacheKey);
    }
  }
};

/**
 * Wallet service functions
 */
export const walletService = {
  // Fetch wallets with cache support
  fetchWallets: async (forceRefresh = false) => {
    const walletsCacheKey = getWalletsCacheKey();
    
    // Return from cache if available and not forcing refresh
    if (!forceRefresh && walletsCacheKey) {
      const cachedWallets = cacheService.get(walletsCacheKey);
      if (cachedWallets) {
        return cachedWallets;
      }
    }
    
    try {
      console.log('[DEBUG] Fetching wallets from API...');
      const response = await api.get("/api/wallets/sync/");
      
      // Log the full response for debugging
      console.log('[DEBUG] Full API response:', response);
      console.log('[DEBUG] Wallets data:', response.data);
      
      const wallets = response.data.wallets;
      
      // Log each wallet's balance for detailed debugging
      wallets.forEach((wallet, index) => {
        console.log(`[DEBUG] Wallet ${index + 1}:`, {
          address: wallet.address,
          chain: wallet.chain,
          balance_usd: wallet.balance_usd,
          balance_type: typeof wallet.balance_usd
        });
      });
      
      // Cache the wallet data
      if (walletsCacheKey) {
        cacheService.set(walletsCacheKey, wallets);
      }
      
      return wallets;
    } catch (error) {
      console.error("[DEBUG] Error fetching wallets:", error);
      console.error("[DEBUG] Error details:", error.response?.data || error.message);
      throw error;
    }
  },
  
  // Add a new wallet
  addWallet: async (walletData) => {
    try {
      console.log('[DEBUG] Adding new wallet:', walletData);
      const response = await api.post("/api/wallets/add/", walletData);
      
      console.log('[DEBUG] Add wallet response:', response.data);
      
      // Invalidate wallet cache to force a refresh
      const walletsCacheKey = getWalletsCacheKey();
      if (walletsCacheKey) {
        cacheService.remove(walletsCacheKey);
      }
      
      return response.data;
    } catch (error) {
      console.error("[DEBUG] Error adding wallet:", error);
      console.error("[DEBUG] Error details:", error.response?.data || error.message);
      throw error;
    }
  },
  
  // Get supported blockchain chains
  getSupportedChains: async (forceRefresh = false) => {
    const cacheKey = "supportedChains";
    
    // Return from cache if available and not forcing refresh
    if (!forceRefresh) {
      const cachedChains = cacheService.get(cacheKey, SUPPORTED_CHAINS_CACHE_EXPIRATION);
      if (cachedChains) {
        return cachedChains;
      }
    }
    
    try {
      console.log('[DEBUG] Fetching supported chains...');
      const response = await api.get("/api/wallets/supported_chains/");
      console.log('[DEBUG] Supported chains response:', response.data);
      
      const chains = response.data.supported_chains;
      
      // Cache the chains data with longer expiration
      cacheService.set(cacheKey, chains, SUPPORTED_CHAINS_CACHE_EXPIRATION);
      
      return chains;
    } catch (error) {
      console.error("[DEBUG] Error fetching supported chains:", error);
      console.error("[DEBUG] Error details:", error.response?.data || error.message);
      throw error;
    }
  },
  
  // Calculate total balance from wallets
  calculateTotalBalance: (wallets) => {
    if (!wallets || !wallets.length) return "0.00";
    
    console.log('[DEBUG] Calculating total balance from wallets:', wallets);
    
    const totalBalance = wallets.reduce((acc, wallet) => {
      const walletBalance = parseFloat(wallet.balance_usd || 0);
      console.log(`[DEBUG] Adding wallet balance: ${wallet.balance_usd} (${typeof wallet.balance_usd}) => ${walletBalance}`);
      return acc + walletBalance;
    }, 0);
    
    console.log(`[DEBUG] Total balance calculated: ${totalBalance}`);
    return totalBalance.toFixed(2);
  }
};

export default walletService;