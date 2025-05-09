import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { useLivePrice } from "../context/LivePriceContext";
import "./LivePrice.css";
import { POLLING_CONFIG } from "../config/pollingConfig";

const LivePrice = ({
  symbol,
  showChange = true,
  showIcon = true,
  size = "medium",
}) => {
  const { getPrice } = useLivePrice();
  const [priceData, setPriceData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const pollingRef = useRef(false);

  // Effect 1: Initial price load
  useEffect(() => {
    console.log(
      `[LivePrice] Component mounted for ${symbol} - loading initial price`
    );
    const initialPrice = getPrice(symbol);
    console.log(`[LivePrice] Initial price for ${symbol}:`, initialPrice);

    if (initialPrice) {
      setPriceData(initialPrice);
    }
  }, [symbol]);

  // Effect 2: Poll for updates - only set up once per component instance
  useEffect(() => {
    // Skip if already set up
    if (pollingRef.current) return;

    // Mark as set up
    pollingRef.current = true;
    console.log(`[LivePrice] Starting polling for ${symbol}`);

    const interval = setInterval(() => {
      setPriceData((prev) => {
        const latestPrice = getPrice(symbol);

        // Occasional logging to avoid flooding console
        if (Math.random() < 0.01) {
          // Log ~1% of checks
          console.log(`[LivePrice] Price check for ${symbol}:`, latestPrice);
        }

        if (latestPrice && (!prev || latestPrice.updatedAt > prev.updatedAt)) {
          console.log(
            `[LivePrice] New price found for ${symbol}:`,
            latestPrice
          );

          // Flash animation when price updates
          setIsUpdating(true);
          setTimeout(() => setIsUpdating(false), 100);

          return latestPrice;
        }
        return prev;
      });
    }, POLLING_CONFIG.UI_POLL_INTERVAL);

    return () => {
      console.log(`[LivePrice] Stopping polling for ${symbol}`);
      clearInterval(interval);
    };
  }, []); // Empty dependency array with ref guard

  // Format price with appropriate decimal places
  const formatPrice = (price) => {
    if (!price) return "—";

    // Use more decimal places for low-value assets
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Format price change percentage
  const formatChange = (change) => {
    if (!change && change !== 0) return "—";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  // Get color class based on price change
  const getChangeColorClass = () => {
    if (!priceData?.change24h) return "";
    return priceData.change24h >= 0 ? "price-positive" : "price-negative";
  };

  // Add the appropriate size class
  const sizeClass = `price-${size}`;

  return (
    <div
      className={`live-price ${sizeClass} ${isUpdating ? "price-update" : ""}`}
    >
      {showIcon && (
        <div className={`price-icon ${getChangeColorClass()}`}>
          {priceData?.change24h >= 0 ? "▲" : "▼"}
        </div>
      )}

      <div className="price-value">${formatPrice(priceData?.price)}</div>

      {showChange && priceData?.change24h && (
        <div className={`price-change ${getChangeColorClass()}`}>
          {formatChange(priceData.change24h)}
        </div>
      )}
    </div>
  );
};

LivePrice.propTypes = {
  symbol: PropTypes.string.isRequired,
  showChange: PropTypes.bool,
  showIcon: PropTypes.bool,
  size: PropTypes.oneOf(["small", "medium", "large"]),
};

export default LivePrice;
