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

<<<<<<< HEAD
// Helper function to get assets cache key for current user
export const getAssetsCacheKey = () => {
  const accessToken = localStorage.getItem("access_token");
  const userId = getUserIdFromToken(accessToken);
  return userId ? `assets_${userId}` : null;
};

=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
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
<<<<<<< HEAD
=======
        console.log('[DEBUG] Using cached wallet data:', data);
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
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
<<<<<<< HEAD
    const assetsCacheKey = getAssetsCacheKey();
    
    if (walletsCacheKey) {
      localStorage.removeItem(walletsCacheKey);
    }
    
    if (assetsCacheKey) {
      localStorage.removeItem(assetsCacheKey);
    }
=======
    if (walletsCacheKey) {
      localStorage.removeItem(walletsCacheKey);
    }
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
  }
};

/**
 * Wallet service functions
 */
export const walletService = {
<<<<<<< HEAD
  // Fetch all wallets
=======
  // Fetch wallets with cache support
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
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
<<<<<<< HEAD
      
      // First sync wallets to make sure they're up to date
      const syncResponse = await api.get("/api/wallets/sync/");
      console.log('[DEBUG] Wallets API response:', syncResponse.data);
      
      // If sync was successful, now get the actual wallet data
      // This is needed because sync endpoint doesn't return wallet balances
      const response = await api.get("/api/wallets/");
      console.log('[DEBUG] Wallets data response:', response.data);
      
      // The API returns an array of wallets
      const wallets = response.data || [];
=======
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
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
      
      // Cache the wallet data
      if (walletsCacheKey) {
        cacheService.set(walletsCacheKey, wallets);
      }
      
      return wallets;
    } catch (error) {
      console.error("[DEBUG] Error fetching wallets:", error);
      console.error("[DEBUG] Error details:", error.response?.data || error.message);
<<<<<<< HEAD
      
      // Return empty array instead of throwing for new users with no wallets
      return [];
    }
  },
  
  // Fetch assets (aggregated tokens across all wallets)
  fetchAssets: async (forceRefresh = false) => {
    const assetsCacheKey = getAssetsCacheKey();
    
    // Return from cache if available and not forcing refresh
    if (!forceRefresh && assetsCacheKey) {
      const cachedAssets = cacheService.get(assetsCacheKey);
      if (cachedAssets) {
        return cachedAssets;
      }
    }
    
    try {
      console.log('[DEBUG] Fetching assets from API...');
      // Using the aggregated assets endpoint
      const response = await api.get("/api/assets/");
      
      console.log('[DEBUG] Assets API response:', response.data);
      
      const assets = response.data || [];
      
      // Cache the assets data
      if (assetsCacheKey) {
        cacheService.set(assetsCacheKey, assets);
      }
      
      return assets;
    } catch (error) {
      console.error("[DEBUG] Error fetching assets:", error);
      console.error("[DEBUG] Error details:", error.response?.data || error.message);
      
      // Return empty array instead of throwing for new users with no assets
      return [];
=======
      throw error;
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
    }
  },
  
  // Add a new wallet
  addWallet: async (walletData) => {
    try {
<<<<<<< HEAD
      console.log('[DEBUG] Adding wallet:', walletData);
=======
      console.log('[DEBUG] Adding new wallet:', walletData);
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
      const response = await api.post("/api/wallets/add/", walletData);
      
      console.log('[DEBUG] Add wallet response:', response.data);
      
<<<<<<< HEAD
      // Invalidate wallet and asset caches to force a refresh
      const walletsCacheKey = getWalletsCacheKey();
      const assetsCacheKey = getAssetsCacheKey();
      
=======
      // Invalidate wallet cache to force a refresh
      const walletsCacheKey = getWalletsCacheKey();
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
      if (walletsCacheKey) {
        cacheService.remove(walletsCacheKey);
      }
      
<<<<<<< HEAD
      if (assetsCacheKey) {
        cacheService.remove(assetsCacheKey);
      }
      
=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
      return response.data;
    } catch (error) {
      console.error("[DEBUG] Error adding wallet:", error);
      console.error("[DEBUG] Error details:", error.response?.data || error.message);
      throw error;
    }
  },
  
<<<<<<< HEAD
  // Remove a wallet
  removeWallet: async (walletData) => {
    try {
      console.log('[DEBUG] Removing wallet:', walletData);
      const response = await api.post("/api/wallets/remove/", walletData);
      
      console.log('[DEBUG] Remove wallet response:', response.data);
      
      // Invalidate wallet and asset caches to force a refresh
      const walletsCacheKey = getWalletsCacheKey();
      const assetsCacheKey = getAssetsCacheKey();
      
      if (walletsCacheKey) {
        cacheService.remove(walletsCacheKey);
      }
      
      if (assetsCacheKey) {
        cacheService.remove(assetsCacheKey);
      }
      
      return response.data;
    } catch (error) {
      console.error("[DEBUG] Error removing wallet:", error);
      console.error("[DEBUG] Error details:", error.response?.data || error.message);
      throw error;
    }
  },
  
=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
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
<<<<<<< HEAD
      // Correct API endpoint from the documentation
      const response = await api.get("/api/wallets/supported-chains/");
      
      console.log('[DEBUG] Supported chains response:', response.data);
      
      const chains = response.data.supported_chains || [];
=======
      const response = await api.get("/api/wallets/supported_chains/");
      console.log('[DEBUG] Supported chains response:', response.data);
      
      const chains = response.data.supported_chains;
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
      
      // Cache the chains data with longer expiration
      cacheService.set(cacheKey, chains, SUPPORTED_CHAINS_CACHE_EXPIRATION);
      
      return chains;
    } catch (error) {
      console.error("[DEBUG] Error fetching supported chains:", error);
      console.error("[DEBUG] Error details:", error.response?.data || error.message);
      throw error;
    }
  },
  
<<<<<<< HEAD
  // Calculate total balance from assets (more reliable than from wallets)
  calculateTotalBalance: (assets) => {
    if (!assets || !assets.length) return "0.00";
    
    console.log('[DEBUG] Calculating total balance from assets:', assets);
    
    const totalBalance = assets.reduce((acc, asset) => {
      const assetValue = parseFloat(asset.total_value || 0);
      return acc + assetValue;
=======
  // Calculate total balance from wallets
  calculateTotalBalance: (wallets) => {
    if (!wallets || !wallets.length) return "0.00";
    
    console.log('[DEBUG] Calculating total balance from wallets:', wallets);
    
    const totalBalance = wallets.reduce((acc, wallet) => {
      const walletBalance = parseFloat(wallet.balance_usd || 0);
      console.log(`[DEBUG] Adding wallet balance: ${wallet.balance_usd} (${typeof wallet.balance_usd}) => ${walletBalance}`);
      return acc + walletBalance;
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
    }, 0);
    
    console.log(`[DEBUG] Total balance calculated: ${totalBalance}`);
    return totalBalance.toFixed(2);
<<<<<<< HEAD
  },
  
  // Calculate 24h change percentage from assets
  calculate24hChangePercent: (assets) => {
    if (!assets || !assets.length) return "0.00";
    
    let totalValue = 0;
    let totalChangeValue = 0;
    
    assets.forEach(asset => {
      const value = parseFloat(asset.total_value || 0);
      const changeValue = parseFloat(asset.total_value_24h_change || 0);
      
      totalValue += value;
      totalChangeValue += changeValue;
    });
    
    if (totalValue === 0) return "0.00";
    
    // Calculate percentage change relative to current value
    const percentChange = (totalChangeValue / (totalValue - totalChangeValue)) * 100;
    
    return percentChange.toFixed(2);
=======
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
  }
};

export default walletService;