// src/context/LivePriceContext.jsx - Improved version

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from "react";
import { useWallet } from "./WalletContext";
import priceFeedService from "../services/priceFeedService";

// Create the context
const LivePriceContext = createContext(null);

export const LivePriceProvider = ({ children }) => {
  const {
    assets,
    totalBalance,
    setTotalBalance,
    changePercent,
    setChangePercent,
  } = useWallet();
  const [prices, setPrices] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const subscribedTokensRef = useRef(new Set());
  const unsubscribeRef = useRef(null);

  // Update prices when receiving real-time updates
  const handlePriceUpdate = useCallback((priceData) => {
    const { symbol, price, change24h } = priceData;

    if (!symbol) return;

    const normalizedSymbol = symbol.toLowerCase();

    setPrices((prevPrices) => ({
      ...prevPrices,
      [normalizedSymbol]: {
        price,
        change24h,
        updatedAt: Date.now(),
      },
    }));

    // This will trigger recalculation of total balance
    recalculatePortfolioValues();
  }, []);

  // Function to recalculate portfolio values when prices change
  const recalculatePortfolioValues = useCallback(() => {
    if (!assets || assets.length === 0) return;

    let newTotalValue = 0;
    let prevDayValue = 0;

    assets.forEach((asset) => {
      const symbol = asset.symbol?.toLowerCase();
      if (!symbol) return;

      const priceData = prices[symbol];
      const amount = parseFloat(asset.total_amount) || 0;

      if (priceData) {
        // Current value based on live price
        const currentValue = amount * priceData.price;
        newTotalValue += currentValue;

        // Previous day value based on percentage change
        const percentChange = priceData.change24h / 100;
        const prevPrice = priceData.price / (1 + percentChange);
        prevDayValue += amount * prevPrice;
      } else {
        // Fallback to stored values if no live price
        newTotalValue += parseFloat(asset.total_value) || 0;
        // Assume previous day value is based on stored percentage
        const assetChange = parseFloat(asset.price_24h_change_percent) || 0;
        const assetValue = parseFloat(asset.total_value) || 0;

        if (assetChange !== 0) {
          const prevAssetValue = assetValue / (1 + assetChange / 100);
          prevDayValue += prevAssetValue;
        } else {
          prevDayValue += assetValue;
        }
      }
    });

    // Only update if we have sensible values
    if (newTotalValue > 0) {
      // Calculate new percentage change
      let newChangePercent = 0;
      if (prevDayValue > 0) {
        newChangePercent =
          ((newTotalValue - prevDayValue) / prevDayValue) * 100;
      }

      // Update the wallet context with new values
      if (setTotalBalance && typeof setTotalBalance === "function") {
        setTotalBalance(newTotalValue.toFixed(2));
      }

      if (setChangePercent && typeof setChangePercent === "function") {
        setChangePercent(newChangePercent.toFixed(2));
      }
    }
  }, [assets, prices, setTotalBalance, setChangePercent]);

  // Subscribe to price updates when assets change
  useEffect(() => {
    // Clean up previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (!assets || assets.length === 0) return;

    setIsLoading(true);

    // Get unique tokens to subscribe to
    const tokensToSubscribe = [];
    const newSubscribedTokens = new Set();

    assets.forEach((asset) => {
      if (!asset.symbol) return;

      const symbol = asset.symbol.toLowerCase();

      if (!subscribedTokensRef.current.has(symbol)) {
        tokensToSubscribe.push({
          symbol,
          address: asset.address,
          chain: asset.chain,
        });
      }

      newSubscribedTokens.add(symbol);
    });

    // Update subscribed tokens ref
    subscribedTokensRef.current = newSubscribedTokens;

    // Subscribe to price updates
    if (tokensToSubscribe.length > 0) {
      const unsubscribe = priceFeedService.subscribeToPrices(
        tokensToSubscribe,
        handlePriceUpdate
      );

      unsubscribeRef.current = unsubscribe;
    }

    setIsLoading(false);

    // Cleanup function
    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current();
        unsubscribeRef.current = null;
      }
    };
  }, [assets, handlePriceUpdate]);

  // Effect to recalculate portfolio value when prices change
  useEffect(() => {
    // Skip if no prices or assets
    if (Object.keys(prices).length === 0 || !assets || assets.length === 0)
      return;

    // Debounce the recalculation to avoid too many updates
    const timer = setTimeout(() => {
      recalculatePortfolioValues();
    }, 500);

    return () => clearTimeout(timer);
  }, [prices, assets, recalculatePortfolioValues]);

  // Get latest price for a specific symbol
  const getPrice = useCallback(
    (symbol) => {
      if (!symbol) return null;

      const normalizedSymbol = symbol.toLowerCase();
      const cachedPrice = prices[normalizedSymbol];

      if (cachedPrice) {
        return cachedPrice;
      }

      // Try to get from service cache
      const latestPrice = priceFeedService.getLatestPrice(normalizedSymbol);
      if (latestPrice) {
        // Create a price object similar to those in the prices state
        return {
          price: latestPrice,
          change24h: 0, // We don't have this from getLatestPrice
          updatedAt: Date.now(),
        };
      }

      return null;
    },
    [prices]
  );

  // Context value
  const contextValue = {
    prices,
    isLoading,
    getPrice,
    recalculatePortfolioValues,
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
