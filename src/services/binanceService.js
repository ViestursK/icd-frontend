// src/services/binanceService.js
// Service for connecting to Binance WebSocket API for live price updates

// Constants
const BINANCE_WS_BASE_URL = "wss://stream.binance.com:9443/ws";
const PRICE_UPDATE_EVENT = "PRICE_UPDATE";

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
  }

  /**
   * Initialize the WebSocket connection
   */
  initialize() {
    if (this.websocket) {
      this.close();
    }

    try {
      // Create a new connection with combined streams endpoint
      // This format allows for subscribing to multiple streams in a single connection
      this.websocket = new WebSocket(BINANCE_WS_BASE_URL);

      // Set up event handlers
      this.websocket.onopen = this.handleOpen.bind(this);
      this.websocket.onmessage = this.handleMessage.bind(this);
      this.websocket.onerror = this.handleError.bind(this);
      this.websocket.onclose = this.handleClose.bind(this);

      console.log("Binance WebSocket - Connecting...");
    } catch (error) {
      console.error("Binance WebSocket - Connection error:", error);
      this.attemptReconnect();
    }
  }

  /**
   * Handle WebSocket connection open
   */
  handleOpen() {
    console.log("Binance WebSocket - Connected");
    this.isConnected = true;
    this.reconnectAttempts = 0;

    // Subscribe to current symbols
    this.subscribeToSymbols();
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
    console.log(`Binance WebSocket - Subscribed to: ${channels.join(", ")}`);
  }

  /**
   * Handle incoming WebSocket messages
   */
  handleMessage(event) {
    try {
      const data = JSON.parse(event.data);
      console.log("Received WebSocket message:", data);

      // Skip subscription confirmation messages
      if (data.result === null && data.id) {
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

        console.log(
          `Price update for ${symbol}: $${price} (${priceChangePercent24h}%)`
        );

        // Store last price
        this.lastPrices[symbol] = {
          price,
          priceChange24h,
          priceChangePercent24h,
          lastUpdate: Date.now(),
        };

        // Notify subscribers
        this.notifySubscribers(PRICE_UPDATE_EVENT, {
          symbol,
          price,
          priceChange24h,
          priceChangePercent24h,
        });
      }
    } catch (error) {
      console.error("Binance WebSocket - Error parsing message:", error);
      console.log("Raw message data:", event.data);
    }
  }

  /**
   * Handle WebSocket errors
   */
  handleError(error) {
    console.error("Binance WebSocket - Error:", error);
  }

  /**
   * Handle WebSocket connection close
   */
  handleClose(event) {
    this.isConnected = false;
    console.log(
      `Binance WebSocket - Connection closed: ${event.code} ${event.reason}`
    );

    // Attempt to reconnect if not a normal closure
    if (event.code !== 1000) {
      this.attemptReconnect();
    }
  }

  /**
   * Attempt to reconnect to WebSocket
   */
  attemptReconnect() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.log("Binance WebSocket - Max reconnect attempts reached");
      return;
    }

    this.reconnectAttempts++;
    console.log(
      `Binance WebSocket - Reconnecting (attempt ${this.reconnectAttempts}/${this.maxReconnectAttempts})...`
    );

    // Clear any existing timer
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
    }

    // Attempt reconnection after delay
    this.reconnectTimer = setTimeout(() => {
      this.initialize();
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
    if (this.isConnected) {
      const channel = `${formattedSymbol.toLowerCase()}usdt@ticker`;
      const subscribeMsg = {
        method: "SUBSCRIBE",
        params: [channel],
        id: Date.now(),
      };
      this.websocket.send(JSON.stringify(subscribeMsg));
      console.log(`Binance WebSocket - Subscribed to: ${channel}`);
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
      console.log(`Binance WebSocket - Unsubscribed from: ${channel}`);
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
    if (this.isConnected) {
      this.subscribeToSymbols();
    } else if (!this.websocket) {
      // Initialize if not already done
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

      console.log("Binance WebSocket - Connection closed");
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
};

export default binanceService;
