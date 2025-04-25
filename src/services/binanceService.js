// src/services/binanceService.js
// Service for connecting to Binance WebSocket API for live price updates

// Constants
const BINANCE_WS_BASE_URL = "wss://stream.binance.com:9443/ws";
const PRICE_UPDATE_EVENT = "PRICE_UPDATE";
const CONNECTION_STATE_EVENT = "CONNECTION_STATE";

class BinanceService {
  constructor() {
    this.websocket = null;
    this.isConnected = false;
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 5;
    this.reconnectDelay = 5000; // 5 seconds
    this.subscribers = {};
    this.subscribedSymbols = new Set();
    this.lastPrices = {};
    this.reconnectTimer = null;

    // Added to control live mode
    this.liveMode = false;

    // Rate limiting - don't update UI too frequently
    this.updateThrottleMs = 1000; // Update UI max once per second
    this.lastUpdateTimestamp = {};
  }

  /**
   * Enable or disable live price updates
   * @param {boolean} enabled - Whether to enable live mode
   */
  setLiveMode(enabled) {
    // If no change in state, do nothing
    if (this.liveMode === enabled) return;

    this.liveMode = enabled;

    if (enabled) {
      // Start the connection if we have symbols to subscribe to
      if (this.subscribedSymbols.size > 0 && !this.isConnected) {
        this.initialize();
      }
    } else {
      // Disconnect if we're turning off live mode
      this.close();
    }

    // Notify subscribers about the connection state change
    this.notifySubscribers(CONNECTION_STATE_EVENT, {
      connected: this.isConnected,
      liveMode: this.liveMode,
    });
  }

  /**
   * Check if live mode is enabled
   * @returns {boolean} - Whether live mode is enabled
   */
  isLiveModeEnabled() {
    return this.liveMode;
  }

  /**
   * Initialize the WebSocket connection
   */
  initialize() {
    // Don't connect if live mode is disabled
    if (!this.liveMode) return;

    if (this.websocket) {
      this.close();
    }

    try {
      // Create a new connection with combined streams endpoint
      this.websocket = new WebSocket(BINANCE_WS_BASE_URL);

      // Set up event handlers
      this.websocket.onopen = this.handleOpen.bind(this);
      this.websocket.onmessage = this.handleMessage.bind(this);
      this.websocket.onerror = this.handleError.bind(this);
      this.websocket.onclose = this.handleClose.bind(this);

      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("Binance WebSocket - Connecting...");
      }
    } catch (error) {
      console.error("Binance WebSocket - Connection error:", error);
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket connection open
   */
  handleOpen() {
    // Only log in development mode
    if (process.env.NODE_ENV === "development") {
      console.log("Binance WebSocket - Connected");
    }

    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Subscribe to current symbols
    this.subscribeToSymbols();

    // Notify subscribers about the connection state
    this.notifySubscribers(CONNECTION_STATE_EVENT, {
      connected: true,
      liveMode: this.liveMode,
    });
  }

  /**
   * Subscribe to multiple symbols via WebSocket
   */
  subscribeToSymbols() {
    if (!this.isConnected || this.subscribedSymbols.size === 0) return;

    // Format symbols for Binance (lowercase and add USDT)
    const channels = Array.from(this.subscribedSymbols).map(
      (symbol) => `${symbol.toLowerCase()}usdt@ticker`
    );

    // Create a subscription message for multiple streams
    const subscribeMsg = {
      method: "SUBSCRIBE",
      params: channels,
      id: Date.now(),
    };

    // Send subscription request
    this.websocket.send(JSON.stringify(subscribeMsg));

    // Only log in development mode
    if (process.env.NODE_ENV === "development") {
      console.log(`Binance WebSocket - Subscribed to: ${channels.join(", ")}`);
    }
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    // Skip processing if live mode is disabled
    if (!this.liveMode) return;

    try {
      const data = JSON.parse(event.data);

      // Skip logging for every message to reduce console spam
      // Only log subscription confirmations in development mode
      if (
        data.result === null &&
        data.id &&
        process.env.NODE_ENV === "development"
      ) {
        console.log("Subscription confirmation received");
        return;
      }

      // Handle ticker events - notice the event type is '24hrTicker' in Binance
      if (data.e === "24hrTicker") {
        // Extract the symbol without USDT
        const symbol = data.s.replace("USDT", "");
        // Use the 'c' field for current price (as string)
        const price = parseFloat(data.c);
        // Use 'p' for price change and 'P' for percentage change
        const priceChange24h = parseFloat(data.p);
        const priceChangePercent24h = parseFloat(data.P);

        // Apply rate limiting - only update UI at most once per second per symbol
        const now = Date.now();
        if (
          this.lastUpdateTimestamp[symbol] &&
          now - this.lastUpdateTimestamp[symbol] < this.updateThrottleMs
        ) {
          return;
        }

        this.lastUpdateTimestamp[symbol] = now;

        // Store last price with previous price for animation
        const previousPrice = this.lastPrices[symbol]?.price || price;

        this.lastPrices[symbol] = {
          price,
          previousPrice,
          priceChange24h,
          priceChangePercent24h,
          lastUpdate: now,
          direction:
            price > previousPrice
              ? "up"
              : price < previousPrice
              ? "down"
              : "unchanged",
        };

        // Notify subscribers
        this.notifySubscribers(PRICE_UPDATE_EVENT, {
          symbol,
          price,
          previousPrice,
          direction:
            price > previousPrice
              ? "up"
              : price < previousPrice
              ? "down"
              : "unchanged",
          priceChange24h,
          priceChangePercent24h,
        });
      }
    } catch (error) {
      console.error("Binance WebSocket - Error parsing message:", error);
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error("Binance WebSocket - Error:", error);

    // Notify subscribers about the connection state
    this.notifySubscribers(CONNECTION_STATE_EVENT, {
      connected: false,
      liveMode: this.liveMode,
      error: "Connection error",
    });
  }

  /**
   * Handle WebSocket connection close
   */
  handleClose(event) {
    this.isConnected = false;

    // Only log in development mode
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Binance WebSocket - Connection closed: ${event.code} ${event.reason}`
      );
    }

    // Notify subscribers about the connection state
    this.notifySubscribers(CONNECTION_STATE_EVENT, {
      connected: false,
      liveMode: this.liveMode,
    });

    // Attempt to reconnect if not a normal closure and live mode is still enabled
    if (event.code !== 1000 && this.liveMode) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts || !this.liveMode) {
      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log(
          "Binance WebSocket - Max reconnect attempts reached or live mode disabled"
        );
      }
      return;
    }

    this.reconnectAttempts++;

    // Only log in development mode
    if (process.env.NODE_ENV === "development") {
      console.log(
        `Binance WebSocket - Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
      );
    }

    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Attempt reconnection after delay
    this.reconnectTimer = setTimeout(() => {
      if (this.liveMode) {
        this.initialize();
      }
    }, this.reconnectDelay);
  }

  /**
   * Subscribe to a specific symbol
   */
  subscribeToSymbol(symbol) {
    // Convert to uppercase
    const formattedSymbol = symbol.toUpperCase();

    // Add to set of subscribed symbols
    this.subscribedSymbols.add(formattedSymbol);

    // If already connected, send subscription
    if (this.isConnected && this.liveMode) {
      const channel = `${formattedSymbol.toLowerCase()}usdt@ticker`;
      const subscribeMsg = {
        method: "SUBSCRIBE",
        params: [channel],
        id: Date.now(),
      };
      this.websocket.send(JSON.stringify(subscribeMsg));

      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log(`Binance WebSocket - Subscribed to: ${channel}`);
      }
    } else if (this.liveMode && !this.isConnected && !this.websocket) {
      // Initialize if live mode is on but not connected
      this.initialize();
    }

    return formattedSymbol;
  }

  /**
   * Unsubscribe from a specific symbol
   */
  unsubscribeFromSymbol(symbol) {
    const formattedSymbol = symbol.toUpperCase();

    if (this.subscribedSymbols.has(formattedSymbol) && this.isConnected) {
      const channel = `${formattedSymbol.toLowerCase()}usdt@ticker`;
      const unsubscribeMsg = {
        method: "UNSUBSCRIBE",
        params: [channel],
        id: Date.now(),
      };
      this.websocket.send(JSON.stringify(unsubscribeMsg));

      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log(`Binance WebSocket - Unsubscribed from: ${channel}`);
      }
    }

    // Remove from set of subscribed symbols
    this.subscribedSymbols.delete(formattedSymbol);
  }

  /**
   * Subscribe to price updates for a list of symbols
   */
  subscribeToMultipleSymbols(symbols) {
    if (!symbols || !Array.isArray(symbols) || symbols.length === 0) {
      return;
    }

    // Add all symbols to the set
    symbols.forEach((symbol) => {
      this.subscribedSymbols.add(symbol.toUpperCase());
    });

    // If already connected, send subscription
    if (this.isConnected && this.liveMode) {
      this.subscribeToSymbols();
    } else if (this.liveMode && !this.websocket) {
      // Initialize if live mode is on but not connected
      this.initialize();
    }
  }

  /**
   * Close the WebSocket connection
   */
  close() {
    if (this.websocket) {
      this.websocket.close();
      this.websocket = null;
      this.isConnected = false;

      if (this.reconnectTimer) {
        clearTimeout(this.reconnectTimer);
        this.reconnectTimer = null;
      }

      // Only log in development mode
      if (process.env.NODE_ENV === "development") {
        console.log("Binance WebSocket - Connection closed");
      }

      // Notify subscribers about the connection state
      this.notifySubscribers(CONNECTION_STATE_EVENT, {
        connected: false,
        liveMode: this.liveMode,
      });
    }
  }

  /**
   * Subscribe to service events
   */
  subscribe(event, callback) {
    if (!this.subscribers[event]) {
      this.subscribers[event] = [];
    }

    this.subscribers[event].push(callback);

    // Return unsubscribe function
    return () => {
      this.subscribers[event] = this.subscribers[event].filter(
        (cb) => cb !== callback
      );
    };
  }

  /**
   * Notify all subscribers of an event
   */
  notifySubscribers(event, data) {
    if (this.subscribers[event]) {
      this.subscribers[event].forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          console.error(
            "Binance WebSocket - Error notifying subscriber:",
            error
          );
        }
      });
    }
  }

  /**
   * Get the last known price for a symbol
   */
  getLastPrice(symbol) {
    const formattedSymbol = symbol.toUpperCase();
    return this.lastPrices[formattedSymbol] || null;
  }

  /**
   * Get all last known prices
   */
  getAllLastPrices() {
    return { ...this.lastPrices };
  }
}

// Create a singleton instance
const binanceService = new BinanceService();

// Export constants and service
export const BINANCE_EVENTS = {
  PRICE_UPDATE: PRICE_UPDATE_EVENT,
  CONNECTION_STATE: CONNECTION_STATE_EVENT,
};

export default binanceService;
