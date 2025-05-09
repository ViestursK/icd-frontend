import React, { useMemo, useState } from "react";
import { useWallet } from "../context/WalletContext";
import { useLivePrice } from "../context/LivePriceContext";
import LivePrice from "./LivePrice";
import "./PriceDashboard.css";

const PriceDashboard = () => {
  const { assets } = useWallet();
  const { prices, isLoading } = useLivePrice();
  const [sortBy, setSortBy] = useState("value");
  const [sortDirection, setSortDirection] = useState("desc");

  // Get unique tokens from assets
  const tokens = useMemo(() => {
    if (!assets || assets.length === 0) return [];

    // Create a map to deduplicate tokens
    const tokenMap = new Map();

    assets.forEach((asset) => {
      const key = `${asset.symbol}-${asset.chain}`.toLowerCase();

      if (!tokenMap.has(key)) {
        tokenMap.set(key, {
          symbol: asset.symbol,
          name: asset.name,
          chain: asset.chain,
          logo: asset.logo || asset.thumbnail,
          totalValue: parseFloat(asset.total_value) || 0,
          totalAmount: parseFloat(asset.total_amount) || 0,
        });
      } else {
        // Update existing token with additional amounts
        const existingToken = tokenMap.get(key);
        existingToken.totalValue += parseFloat(asset.total_value) || 0;
        existingToken.totalAmount += parseFloat(asset.total_amount) || 0;
      }
    });

    return Array.from(tokenMap.values());
  }, [assets]);

  // Sort tokens based on current sort settings
  const sortedTokens = useMemo(() => {
    if (!tokens || tokens.length === 0) return [];

    return [...tokens].sort((a, b) => {
      let aValue, bValue;

      switch (sortBy) {
        case "symbol":
          aValue = a.symbol?.toLowerCase() || "";
          bValue = b.symbol?.toLowerCase() || "";
          break;
        case "name":
          aValue = a.name?.toLowerCase() || "";
          bValue = b.name?.toLowerCase() || "";
          break;
        case "price":
          aValue = parseFloat(prices[a.symbol?.toLowerCase()]?.price || 0);
          bValue = parseFloat(prices[b.symbol?.toLowerCase()]?.price || 0);
          break;
        case "change":
          aValue = parseFloat(prices[a.symbol?.toLowerCase()]?.change24h || 0);
          bValue = parseFloat(prices[b.symbol?.toLowerCase()]?.change24h || 0);
          break;
        case "value":
        default:
          aValue = a.totalValue || 0;
          bValue = b.totalValue || 0;
          break;
      }

      return sortDirection === "asc"
        ? aValue > bValue
          ? 1
          : -1
        : aValue < bValue
        ? 1
        : -1;
    });
  }, [tokens, prices, sortBy, sortDirection]);

  // Handle sort change
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle direction if same column
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      // Set new column and default to descending
      setSortBy(column);
      setSortDirection("desc");
    }
  };

  // Format number with commas
  const formatNumber = (number, decimals = 2) => {
    if (!number && number !== 0) return "—";
    return parseFloat(number).toLocaleString(undefined, {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
  };

  return (
    <div className="price-dashboard">
      <div className="dashboard-header">
        <h2>Live Market Prices</h2>
      </div>

      <div className="price-table-container">
        <table className="price-table">
          <thead>
            <tr>
              <th onClick={() => handleSort("name")} className="sortable">
                Asset
                {sortBy === "name" && (
                  <span className="sort-indicator">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("price")} className="sortable">
                Price
                {sortBy === "price" && (
                  <span className="sort-indicator">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th onClick={() => handleSort("change")} className="sortable">
                24h Change
                {sortBy === "change" && (
                  <span className="sort-indicator">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
              <th>Holdings</th>
              <th onClick={() => handleSort("value")} className="sortable">
                Value
                {sortBy === "value" && (
                  <span className="sort-indicator">
                    {sortDirection === "asc" ? "↑" : "↓"}
                  </span>
                )}
              </th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              // Skeleton loading state
              Array(5)
                .fill(0)
                .map((_, index) => (
                  <tr
                    key={`skeleton-${index}`}
                    className="price-row skeleton-row"
                  >
                    <td>
                      <div className="asset-info skeleton">
                        <div className="asset-icon skeleton"></div>
                        <div className="asset-details skeleton"></div>
                      </div>
                    </td>
                    <td>
                      <div className="skeleton"></div>
                    </td>
                    <td>
                      <div className="skeleton"></div>
                    </td>
                    <td>
                      <div className="skeleton"></div>
                    </td>
                    <td>
                      <div className="skeleton"></div>
                    </td>
                  </tr>
                ))
            ) : sortedTokens.length > 0 ? (
              sortedTokens.map((token, index) => (
                <tr
                  key={`${token.symbol}-${token.chain}-${index}`}
                  className="price-row"
                >
                  <td>
                    <div className="asset-info">
                      {token.logo ? (
                        <img
                          src={token.logo}
                          alt={token.symbol}
                          className="asset-logo"
                        />
                      ) : (
                        <div className="asset-icon">{token.symbol?.[0]}</div>
                      )}
                      <div className="asset-details">
                        <div className="asset-name">{token.name}</div>
                        <div className="asset-meta">
                          <span className="asset-symbol">{token.symbol}</span>
                          {token.chain && (
                            <span className="asset-chain">{token.chain}</span>
                          )}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <LivePrice
                      symbol={token.symbol}
                      showChange={false}
                      size="medium"
                    />
                  </td>
                  <td>
                    <LivePrice
                      symbol={token.symbol}
                      showIcon={false}
                      size="medium"
                    />
                  </td>
                  <td>
                    <div className="token-amount">
                      <span>{formatNumber(token.totalAmount, 4)}</span>
                      <span className="token-symbol">{token.symbol}</span>
                    </div>
                  </td>
                  <td>
                    <div className="token-value">
                      ${formatNumber(token.totalValue)}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={5} className="empty-state">
                  <div>
                    <p>No assets found in your portfolio.</p>
                    <p>Add wallets to start tracking prices.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PriceDashboard;
