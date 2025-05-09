import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { useWallet } from "./WalletContext";
import priceFeedService from "../services/priceFeedService";

// Create the context
const LivePriceContext = createContext(null);

export const LivePriceProvider = ({ children }) => {
  const { assets } = useWallet();
  const [prices, setPrices] = useState({});
  const [isLoading, setIsLoading] = useState(false);

  // Update prices when receiving real-time updates
  const handlePriceUpdate = useCallback((priceData) => {
    const { symbol, price, change24h } = priceData;

    setPrices((prevPrices) => ({
      ...prevPrices,
      [symbol]: {
        price,
        change24h,
        updatedAt: Date.now(),
      },
    }));
  }, []);

  // Subscribe to price updates when assets change
  useEffect(() => {
    let unsubscribe = () => {};

    if (assets && assets.length > 0) {
      setIsLoading(true);

      // Create tokens array for subscription
      const tokens = assets
        .filter((asset) => asset.symbol) // Make sure we have a symbol
        .map((asset) => ({
          symbol: asset.symbol?.toLowerCase(),
          address: asset.address,
          chain: asset.chain,
        }));

      // Only subscribe if we have valid tokens
      if (tokens.length > 0) {
        // Subscribe to price updates
        unsubscribe = priceFeedService.subscribeToPrices(
          tokens,
          handlePriceUpdate
        );
      }

      setIsLoading(false);
    }

    // Cleanup subscription when component unmounts or assets change
    return () => {
      unsubscribe();
    };
  }, [assets, handlePriceUpdate]);

  // Get latest price for a specific symbol
  const getPrice = (symbol) => {
    if (!symbol) return null;

    const normalizedSymbol = symbol.toLowerCase();
    const cachedPrice = prices[normalizedSymbol];

    if (cachedPrice) {
      return cachedPrice;
    }

    // Try to get from service cache
    const latestPrice = priceFeedService.getLatestPrice(normalizedSymbol);
    if (latestPrice) {
      return {
        price: latestPrice,
        updatedAt: Date.now(),
      };
    }

    return null;
  };

  // Context value
  const contextValue = {
    prices,
    isLoading,
    getPrice,
  };

  return (
    <LivePriceContext.Provider value={contextValue}>
      {children}
    </LivePriceContext.Provider>
  );
};

// Hook to use price context
export const useLivePrice = () => {
  const context = useContext(LivePriceContext);

  if (!context) {
    throw new Error("useLivePrice must be used within a LivePriceProvider");
  }

  return context;
};

export default LivePriceContext;
