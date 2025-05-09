import React, { useEffect, useState, useRef } from "react";
import PropTypes from "prop-types";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import { useLivePrice } from "../context/LivePriceContext";
import "./LivePrice.css";
import { POLLING_CONFIG } from "../config/pollingConfig";

const LivePrice = ({
  symbol,
  showChange = true,
  showIcon = true,
  size = "medium",
  defaultPrice = null,
  defaultChange = null,
}) => {
  const { getPrice } = useLivePrice();
  const [priceData, setPriceData] = useState(null);
  const [isUpdating, setIsUpdating] = useState(false);
  const prevPriceRef = useRef(null);
  const pollingIntervalRef = useRef(null);
  const mountedRef = useRef(true);

  // Format price with appropriate decimal places based on value
  const formatPrice = (price) => {
    if (!price && price !== 0) return "—";

    // Use more decimal places for low-value assets
    if (price < 0.01) return price.toFixed(6);
    if (price < 1) return price.toFixed(4);
    if (price < 100) return price.toFixed(2);
    return price.toLocaleString(undefined, { maximumFractionDigits: 2 });
  };

  // Format price change percentage with sign
  const formatChange = (change) => {
    if (!change && change !== 0) return "—";
    const sign = change >= 0 ? "+" : "";
    return `${sign}${change.toFixed(2)}%`;
  };

  // Initialize with either API data or provided default values
  useEffect(() => {
    const initialPrice =
      getPrice(symbol) ||
      (defaultPrice !== null && defaultChange !== null
        ? {
            price: defaultPrice,
            change24h: defaultChange,
            updatedAt: Date.now(),
          }
        : null);

    if (initialPrice) {
      setPriceData(initialPrice);
      prevPriceRef.current = initialPrice.price;
    }

    return () => {
      mountedRef.current = false;
    };
  }, [symbol, defaultPrice, defaultChange, getPrice]);

  // Set up polling interval for price updates
  useEffect(() => {
    const checkForUpdates = () => {
      const latestPrice = getPrice(symbol);

      // Only update if we have new data and it's actually different
      if (
        latestPrice &&
        (!priceData || latestPrice.updatedAt > (priceData.updatedAt || 0)) &&
        prevPriceRef.current !== latestPrice.price
      ) {
        // Store previous price for comparison
        prevPriceRef.current = latestPrice.price;

        // Flash animation when price updates
        setIsUpdating(true);
        setTimeout(() => {
          if (mountedRef.current) {
            setIsUpdating(false);
          }
        }, 500);

        setPriceData(latestPrice);
      }
    };

    // Initial check
    checkForUpdates();

    // Clear any existing interval
    if (pollingIntervalRef.current) {
      clearInterval(pollingIntervalRef.current);
    }

    // Set up new interval
    pollingIntervalRef.current = setInterval(
      checkForUpdates,
      POLLING_CONFIG.UI_POLL_INTERVAL
    );

    // Cleanup on unmount or when symbol changes
    return () => {
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
      }
    };
  }, [symbol, priceData, getPrice]);

  // Get color class based on price change
  const getChangeColorClass = () => {
    if (!priceData?.change24h && priceData?.change24h !== 0) return "";
    return priceData.change24h >= 0 ? "price-positive" : "price-negative";
  };

  // Add the appropriate size class
  const sizeClass = `price-${size}`;

  return (
    <div
      className={`live-price ${sizeClass} ${
        isUpdating ? "price-update" : ""
      } ${getChangeColorClass()}`}
    >
      {showIcon && priceData?.change24h !== undefined && (
        <div className="price-icon">
          {priceData.change24h >= 0 ? <FaCaretUp /> : <FaCaretDown />}
        </div>
      )}

      <div className="price-value">${formatPrice(priceData?.price)}</div>

      {showChange && priceData?.change24h !== undefined && (
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
  defaultPrice: PropTypes.number,
  defaultChange: PropTypes.number,
};

export default LivePrice;
