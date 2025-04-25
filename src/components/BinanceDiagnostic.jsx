import React, { useState, useEffect } from "react";
import binanceService, { BINANCE_EVENTS } from "../services/binanceService";

// This is a diagnostic component to test Binance WebSocket connection
// Add this to your Dashboard.jsx temporarily to debug Binance connection

const BinanceDiagnostic = () => {
  const [status, setStatus] = useState("Initializing...");
  const [messages, setMessages] = useState([]);
  const [testSymbol, setTestSymbol] = useState("BTC");

  // Initialize connection on mount
  useEffect(() => {
    setStatus("Connecting to Binance WebSocket...");

    // Subscribe to BTC updates as a test
    binanceService.subscribeToSymbol(testSymbol);

    // Listen for price updates
    const unsubscribe = binanceService.subscribe(
      BINANCE_EVENTS.PRICE_UPDATE,
      handlePriceUpdate
    );

    setStatus("Connected and listening for updates");

    // Clean up on unmount
    return () => {
      unsubscribe();
      binanceService.close();
      setStatus("Disconnected");
    };
  }, [testSymbol]);

  // Handle price updates
  const handlePriceUpdate = (priceData) => {
    const { symbol, price, priceChangePercent24h } = priceData;

    const messageText = `${symbol}: $${price.toFixed(2)} (${
      priceChangePercent24h > 0 ? "+" : ""
    }${priceChangePercent24h.toFixed(2)}%)`;

    // Add new message to the list
    setMessages((prev) => [
      {
        id: Date.now(),
        text: messageText,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...prev.slice(0, 9), // Keep only 10 most recent messages
    ]);
  };

  // Change test symbol
  const changeSymbol = () => {
    // Cycle between common symbols
    const symbols = ["BTC", "ETH", "BNB", "SOL"];
    const currentIndex = symbols.indexOf(testSymbol);
    const nextIndex = (currentIndex + 1) % symbols.length;

    // Unsubscribe from current symbol
    binanceService.unsubscribeFromSymbol(testSymbol);

    // Set new symbol
    const newSymbol = symbols[nextIndex];
    setTestSymbol(newSymbol);

    // Subscribe to new symbol
    binanceService.subscribeToSymbol(newSymbol);

    setMessages([
      {
        id: Date.now(),
        text: `Changed subscription to ${newSymbol}`,
        timestamp: new Date().toLocaleTimeString(),
      },
      ...messages,
    ]);
  };

  return (
    <div className="binance-diagnostic">
      <h3>Binance WebSocket Diagnostic</h3>
      <p>
        Status:{" "}
        <span
          className={
            status.includes("Connected") ? "status-ok" : "status-error"
          }
        >
          {status}
        </span>
      </p>
      <p>
        Testing symbol: <strong>{testSymbol}USDT</strong>{" "}
        <button onClick={changeSymbol}>Change Symbol</button>
      </p>

      <div className="message-container">
        <h4>Recent Price Updates:</h4>
        {messages.length === 0 ? (
          <p>Waiting for updates...</p>
        ) : (
          <ul>
            {messages.map((msg) => (
              <li key={msg.id}>
                <span className="message-time">[{msg.timestamp}]</span>{" "}
                {msg.text}
              </li>
            ))}
          </ul>
        )}
      </div>

      <style jsx>{`
        .binance-diagnostic {
          background: rgba(0, 0, 0, 0.2);
          border: 1px solid var(--color-primary);
          border-radius: 8px;
          padding: 1rem;
          margin: 1rem 0;
        }

        .status-ok {
          color: var(--color-success);
          font-weight: bold;
        }

        .status-error {
          color: var(--color-error);
          font-weight: bold;
        }

        .message-container {
          max-height: 200px;
          overflow-y: auto;
          background: rgba(0, 0, 0, 0.1);
          border-radius: 4px;
          padding: 0.5rem;
        }

        ul {
          list-style: none;
          padding: 0;
          margin: 0;
        }

        li {
          padding: 0.25rem 0;
          border-bottom: 1px solid rgba(255, 255, 255, 0.1);
        }

        .message-time {
          color: var(--color-text-secondary);
          font-size: 0.8rem;
          margin-right: 0.5rem;
        }

        button {
          background: var(--color-primary);
          color: white;
          border: none;
          border-radius: 4px;
          padding: 0.25rem 0.5rem;
          margin-left: 0.5rem;
          cursor: pointer;
        }

        button:hover {
          background: var(--color-primary-dark);
        }
      `}</style>
    </div>
  );
};

export default BinanceDiagnostic;
