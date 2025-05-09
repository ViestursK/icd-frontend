// priceFeedService.js - Real-time price feed service
import { authEvents } from "../api/api";
import { POLLING_CONFIG } from "../config/pollingConfig"; // Import polling configuration

// Simple debounce function to prevent too many updates
function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

class PriceFeedService {
  constructor() {
    this.binanceWs = null;
    this.dexscreenerIntervals = {};
    this.priceSubscriptions = new Map(); // Maps token symbols to callback functions
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 2000; // Start with 2s delay
    this.lastPrices = new Map(); // Cache of latest prices
    this.updateCallbacks = new Map(); // Debounced callbacks
  }

  /**
   * Initialize the price feed service
   */
  init() {
    // Subscribe to auth events to handle disconnections when logging out
    authEvents.subscribe("logout", () => this.disconnect());

    // Auto-reconnect on window focus
    window.addEventListener("focus", () => {
      if (!this.isConnected) {
        this.reconnect();
      }
    });
  }

  /**
   * Subscribe to price updates for specific tokens
   * @param {Array} tokens - Array of token symbols to track
   * @param {Function} callback - Function to call with price updates
   * @returns {Function} - Unsubscribe function
   */
  subscribeToPrices(tokens, callback) {
    if (!tokens || tokens.length === 0) return () => {};

    const majorTokens = [];
    const minorTokens = [];

    // Separate tokens into major (for Binance) and minor (for Dexscreener)
    tokens.forEach((token) => {
      const symbol = token.symbol?.toLowerCase();
      if (!symbol) return;

      // Major tokens available on Binance
      if (
        [
          "btc",
          "eth",
          "bnb",
          "sol",
          "ada",
          "xrp",
          "doge",
          "dot",
          "avax",
          "matic",
        ].includes(symbol)
      ) {
        majorTokens.push(symbol);
      } else {
        minorTokens.push(token);
      }

      // Add to subscriptions map
      if (!this.priceSubscriptions.has(symbol)) {
        this.priceSubscriptions.set(symbol, new Set());
      }
      this.priceSubscriptions.get(symbol).add(callback);

      // Send cached price immediately if available
      if (this.lastPrices.has(symbol)) {
        callback({
          symbol,
          price: this.lastPrices.get(symbol),
          timestamp: Date.now(),
        });
      }
    });

    // Connect to Binance for major tokens
    if (majorTokens.length > 0 && !this.binanceWs) {
      this.connectToBinance(majorTokens);
    } else if (majorTokens.length > 0 && this.binanceWs) {
      // If already connected, update subscriptions
      this.updateBinanceSubscriptions(majorTokens);
    }

    // Set up polling for minor tokens via Dexscreener
    if (minorTokens.length > 0) {
      this.pollDexscreener(minorTokens);
    }

    // Return unsubscribe function
    return () => {
      tokens.forEach((token) => {
        const symbol = token.symbol?.toLowerCase();
        if (!symbol) return;

        if (this.priceSubscriptions.has(symbol)) {
          this.priceSubscriptions.get(symbol).delete(callback);

          // If no more subscribers for this token, clean up
          if (this.priceSubscriptions.get(symbol).size === 0) {
            this.priceSubscriptions.delete(symbol);

            // Clear Dexscreener interval if exists
            if (this.dexscreenerIntervals[symbol]) {
              clearInterval(this.dexscreenerIntervals[symbol]);
              delete this.dexscreenerIntervals[symbol];
            }
          }
        }
      });

      // If no more subscriptions, disconnect
      if (this.priceSubscriptions.size === 0) {
        this.disconnect();
      }
    };
  }

  /**
   * Connect to Binance WebSocket
   * @param {Array} tokens - Array of token symbols to track
   */
  connectToBinance(tokens) {
    if (!tokens || tokens.length === 0) return;

    // Format tokens for stream names
    const streams = tokens.map((symbol) => `${symbol}usdt@ticker`).join("/");
    const wsUrl = `wss://stream.binance.com:9443/stream?streams=${streams}`;

    try {
      this.binanceWs = new WebSocket(wsUrl);

      this.binanceWs.onopen = () => {
        console.log("[PriceFeed] Connected to Binance WebSocket successfully");
        this.isConnected = true;
        this.reconnectAttempts = 0;
        this.reconnectDelay = 2000; // Reset reconnect delay
      };

      this.binanceWs.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);

          // Log first message received to verify connection
          if (!this._hasLoggedFirstMessage) {
            console.log(
              "[PriceFeed] First message received from Binance:",
              data
            );
            this._hasLoggedFirstMessage = true;
          }

          if (data && data.data) {
            const ticker = data.data;
            const symbol = ticker.s.replace("USDT", "").toLowerCase();
            const price = parseFloat(ticker.c); // Current price

            // Update last price cache
            this.lastPrices.set(symbol, price);

            // Log price update - but only occasionally to avoid flooding console
            if (Math.random() < 0.01) {
              // Log ~1% of updates
              console.log(
                `[PriceFeed] Price update for ${symbol}: $${price} (${ticker.P}% 24h change)`
              );
            }

            // Notify subscribers
            if (this.priceSubscriptions.has(symbol)) {
              const priceUpdate = {
                symbol,
                price,
                change24h: parseFloat(ticker.P), // 24h percent change
                timestamp: Date.now(),
              };

              this.priceSubscriptions.get(symbol).forEach((callback) => {
                // Get or create debounced callback
                if (!this.updateCallbacks.has(callback)) {
                  this.updateCallbacks.set(callback, debounce(callback, 500));
                }

                // Call the debounced version
                const debouncedCallback = this.updateCallbacks.get(callback);
                debouncedCallback(priceUpdate);
              });
            } else {
              console.log(
                `[PriceFeed] Received update for ${symbol} but no subscribers found`
              );
            }
          }
        } catch (err) {
          console.error(
            "[PriceFeed] Error parsing Binance WebSocket message:",
            err
          );
          console.error("[PriceFeed] Raw message data:", event.data);
        }
      };

      this.binanceWs.onerror = (error) => {
        console.error("[PriceFeed] Binance WebSocket error:", error);
        this.isConnected = false;
        this.reconnect();
      };

      this.binanceWs.onclose = (event) => {
        console.log(
          `[PriceFeed] Binance WebSocket closed with code ${event.code}, reason: ${event.reason}`
        );
        this.isConnected = false;
        this.reconnect();
      };

      // Set up ping interval to keep connection alive
      this.pingInterval = setInterval(() => {
        if (this.binanceWs && this.isConnected) {
          this.binanceWs.send(JSON.stringify({ method: "PING" }));
        }
      }, 30000); // Every 30 seconds
    } catch (error) {
      console.error("Failed to connect to Binance WebSocket:", error);
      this.isConnected = false;
      this.reconnect();
    }
  }

  /**
   * Update Binance subscriptions with new tokens
   * @param {Array} tokens - Array of token symbols to track
   */
  updateBinanceSubscriptions(tokens) {
    // For simplicity, just reconnect with all tokens
    if (this.binanceWs) {
      this.binanceWs.close();
      this.binanceWs = null;
    }
    this.connectToBinance(tokens);
  }

  /**
   * Set up polling for tokens via Dexscreener
   * @param {Array} tokens - Array of token objects
   */
  pollDexscreener(tokens) {
    console.log(
      `[PriceFeed] Setting up Dexscreener polling for ${tokens.length} tokens`
    );

    tokens.forEach((token) => {
      const symbol = token.symbol?.toLowerCase();

      if (!symbol) {
        console.warn(
          "[PriceFeed] Token without symbol skipped in Dexscreener polling",
          token
        );
        return;
      }

      if (this.dexscreenerIntervals[symbol]) {
        console.log(
          `[PriceFeed] Dexscreener polling already set up for ${symbol}, skipping`
        );
        return;
      }

      console.log(`[PriceFeed] Setting up Dexscreener polling for ${symbol}`);

      // Store pair information once we find it
      let pairInfo = null;

      // Function to fetch price from Dexscreener
      const fetchPrice = async () => {
        try {
          let url;

          // If we've already resolved the pair, use the pairs endpoint
          if (pairInfo) {
            url = `https://api.dexscreener.com/latest/dex/pairs/${pairInfo.chainId}/${pairInfo.pairAddress}`;
            console.log(
              `[PriceFeed] Fetching price for ${symbol} using resolved pair: ${url}`
            );
          } else {
            // Otherwise, search for the pair first
            url = `https://api.dexscreener.com/latest/dex/search?q=${symbol}&limit=1`;
            console.log(`[PriceFeed] Searching for ${symbol} pair: ${url}`);
          }

          const response = await fetch(url);
          const data = await response.json();

          // If we're searching, extract the pair info
          if (!pairInfo && data && data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0]; // Get the first pair (most liquid)
            pairInfo = {
              chainId: pair.chainId,
              pairAddress: pair.pairAddress,
              dexId: pair.dexId,
            };

            console.log(`[PriceFeed] Resolved ${symbol} pair:`, pairInfo);

            // Immediately fetch using the proper pairs endpoint
            return fetchPrice();
          }

          // Process the pair data
          if (data && data.pairs && data.pairs.length > 0) {
            const pair = data.pairs[0];
            const price = parseFloat(pair.priceUsd);

            console.log(
              `[PriceFeed] ${symbol} price: $${price} from ${pair.dexId} on ${pair.chainId}`
            );

            // Update last price cache
            this.lastPrices.set(symbol, price);

            // Notify subscribers
            if (this.priceSubscriptions.has(symbol)) {
              const priceUpdate = {
                symbol,
                price,
                change24h: parseFloat(pair.priceChange?.h24 || 0),
                timestamp: Date.now(),
              };

              this.priceSubscriptions.get(symbol).forEach((callback) => {
                // Get or create debounced callback
                if (!this.updateCallbacks.has(callback)) {
                  this.updateCallbacks.set(callback, debounce(callback, 500));
                }

                // Call the debounced version
                const debouncedCallback = this.updateCallbacks.get(callback);
                debouncedCallback(priceUpdate);
              });
            } else {
              console.log(`[PriceFeed] No subscribers found for ${symbol}`);
            }
          } else {
            console.warn(
              `[PriceFeed] No pairs found for ${symbol} in Dexscreener response`
            );

            // If we're using the pairs endpoint and got nothing, reset pair info to try search again
            if (pairInfo) {
              console.log(
                `[PriceFeed] Resetting pair info for ${symbol} to try search again`
              );
              pairInfo = null;
            }
          }
        } catch (error) {
          console.error(
            `[PriceFeed] Error fetching price for ${symbol}:`,
            error
          );
          // Reset pair info if there was an error
          if (pairInfo && error.message.includes("404")) {
            console.log(
              `[PriceFeed] Pair not found, resetting pair info for ${symbol}`
            );
            pairInfo = null;
          }
        }
      };

      // Fetch immediately
      console.log(`[PriceFeed] Initial fetch for ${symbol}`);
      fetchPrice();

      // Then set up polling interval (every 10 seconds)
      console.log(`[PriceFeed] Setting up interval for ${symbol}`);
      this.dexscreenerIntervals[symbol] = setInterval(
        fetchPrice,
        POLLING_CONFIG.DEXSCREENER_POLL_INTERVAL
      );
    });
  }

  /**
   * Reconnect to WebSocket after connection loss
   */
  reconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error("Max reconnection attempts reached");
      return;
    }

    setTimeout(() => {
      console.log(
        `Attempting to reconnect (${this.reconnectAttempts + 1}/${
          this.maxReconnectAttempts
        })...`
      );

      // Get all major tokens from subscriptions
      const majorTokens = Array.from(this.priceSubscriptions.keys()).filter(
        (symbol) =>
          [
            "btc",
            "eth",
            "bnb",
            "sol",
            "ada",
            "xrp",
            "doge",
            "dot",
            "avax",
            "matic",
          ].includes(symbol)
      );

      if (majorTokens.length > 0) {
        this.connectToBinance(majorTokens);
      }

      this.reconnectAttempts++;
      this.reconnectDelay = Math.min(this.reconnectDelay * 1.5, 30000); // Exponential backoff up to 30s
    }, this.reconnectDelay);
  }

  /**
   * Disconnect from WebSocket and clear all intervals
   */
  disconnect() {
    if (this.binanceWs) {
      this.binanceWs.close();
      this.binanceWs = null;
    }

    // Clear all Dexscreener polling intervals
    Object.keys(this.dexscreenerIntervals).forEach((key) => {
      clearInterval(this.dexscreenerIntervals[key]);
    });

    this.dexscreenerIntervals = {};
    this.isConnected = false;
    this.priceSubscriptions.clear();
    console.log("[PriceFeed] Price feed disconnected");
  }

  /**
   * Get the latest cached price for a token
   * @param {string} symbol - Token symbol
   * @returns {number|null} - Latest price or null if not available
   */
  getLatestPrice(symbol) {
    if (!symbol) return null;
    return this.lastPrices.get(symbol.toLowerCase()) || null;
  }
}

// Create a singleton instance
const priceFeedService = new PriceFeedService();
priceFeedService.init();

export default priceFeedService;
