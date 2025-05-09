import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import { FaCaretUp, FaCaretDown, FaSearch, FaTimes } from "react-icons/fa";
import "./WalletTable.css";
import "./AssetTable.css";
import "./skeleton.css";
import LivePrice from "./LivePrice";

const AssetTable = ({
  assets = [],
  isLoading,
  visibleCount = 15,
  setVisibleCount,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("total_value"); // Default sort by value
  const [sortDirection, setSortDirection] = useState("desc"); // Default highest value first
  const [selectedChain, setSelectedChain] = useState("all");

  // Collect all unique chains from assets
  const uniqueChains = useMemo(() => {
    const chains = assets
      .map((asset) => asset.chain?.toLowerCase())
      .filter(Boolean);
    return ["all", ...new Set(chains)].filter((chain) => chain); // Remove empty values
  }, [assets]);

  // Format number with commas and decimal places
  const formatNumber = useCallback((number, decimalPlaces = 2) => {
    if (!number && number !== 0) return "0.00";
    return parseFloat(number).toLocaleString("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  }, []);

  // Format crypto amount with appropriate decimal places
  const formatCryptoAmount = useCallback(
    (amount, symbol) => {
      if (!amount && amount !== 0) return "0.00";

      // Use more decimal places for high-value tokens
      const decimalPlaces = ["BTC", "ETH", "WBTC"].includes(
        symbol?.toUpperCase()
      )
        ? 6
        : 4;
      return formatNumber(amount, decimalPlaces);
    },
    [formatNumber]
  );

  // Render asset icon (logo or fallback)
  const renderAssetIcon = useCallback((asset) => {
    const symbolClass = asset.symbol?.toLowerCase() || "";
    if (asset.logo) {
      return (
        <>
          <img
            src={asset.thumbnail || asset.logo}
            alt={asset.symbol}
            className="asset-logo"
            onError={(e) => {
              e.target.style.display = "none";
              e.target.nextSibling.style.display = "flex";
            }}
          />
          <span
            className={`asset-icon ${symbolClass}`}
            style={{ display: "none" }}
          >
            {asset.symbol?.substring(0, 1)}
          </span>
        </>
      );
    }
    return (
      <span className={`asset-icon ${symbolClass}`}>
        {asset.symbol?.substring(0, 1)}
      </span>
    );
  }, []);

  // Filter assets based on search query and selected chain
  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      // Search in name, symbol, and chain fields
      const matchesSearch =
        !searchQuery ||
        asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.chain?.toLowerCase().includes(searchQuery.toLowerCase());

      // Filter by chain if not "all"
      const matchesChain =
        selectedChain === "all" || asset.chain?.toLowerCase() === selectedChain;

      return matchesSearch && matchesChain;
    });
  }, [assets, searchQuery, selectedChain]);

  // Sort the filtered assets
  const sortedAssets = useMemo(() => {
    if (!sortField) return filteredAssets;

    return [...filteredAssets].sort((a, b) => {
      let aValue, bValue;

      switch (sortField) {
        case "symbol":
        case "name":
          aValue = a[sortField]?.toLowerCase() || "";
          bValue = b[sortField]?.toLowerCase() || "";
          return sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        case "price":
        case "price_24h_change_percent":
        case "total_amount":
        case "total_value":
          aValue = parseFloat(a[sortField]) || 0;
          bValue = parseFloat(b[sortField]) || 0;
          return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
        default:
          return 0;
      }
    });
  }, [filteredAssets, sortField, sortDirection]);

  // Slice the sorted assets for pagination
  const visibleAssets = useMemo(() => {
    return sortedAssets.slice(0, visibleCount);
  }, [sortedAssets, visibleCount]);

  // Toggle sort direction or change sort field
  const toggleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc"); // Default to descending when changing fields
      }
    },
    [sortField]
  );

  // Clear search query
  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  // Handle showing more assets
  const handleShowMore = useCallback(() => {
    if (setVisibleCount) {
      setVisibleCount((prev) => prev + 10);
    }
  }, [setVisibleCount]);

  // Handle showing skeleton loading state
  if (isLoading) {
    return (
      <div
        className="wallet-table-container"
        role="region"
        aria-label="Asset holdings"
        aria-busy="true"
      >
        <table className="wallet-table">
          <thead>
            <tr>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
              <th>
                <div className="skeleton skeleton-text small"></div>
              </th>
            </tr>
          </thead>
          <tbody>
            {[...Array(8)].map((_, index) => (
              <tr key={index} className="wallet-row skeleton-row">
                <td>
                  <div className="asset-info">
                    <div className="skeleton asset-icon"></div>
                    <div
                      className="skeleton-text medium"
                      style={{ width: "100px" }}
                    ></div>
                  </div>
                </td>
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
                <td>
                  <div className="skeleton skeleton-text medium"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  return (
    <div
      className="wallet-table-container"
      role="region"
      aria-label="Asset holdings"
    >
      <div className="table-controls">
        <div className="search-container">
          <div className="search-input-wrapper">
            <FaSearch className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, symbol or chain..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
            />
            {searchQuery && (
              <button
                onClick={clearSearch}
                className="clear-search"
                aria-label="Clear search"
              >
                <FaTimes />
              </button>
            )}
          </div>

          {filteredAssets.length > 0 && (
            <div className="search-results-count">
              Showing {Math.min(visibleAssets.length, filteredAssets.length)} of{" "}
              {filteredAssets.length} assets
              {searchQuery && ` matching "${searchQuery}"`}
              {selectedChain !== "all" && ` on ${selectedChain.toUpperCase()}`}
            </div>
          )}
        </div>

        <div className="filter-buttons">
          {uniqueChains.map((chain) => (
            <button
              key={chain}
              className={`filter-button ${
                selectedChain === chain ? "active" : ""
              }`}
              onClick={() => setSelectedChain(chain)}
            >
              {chain === "all" ? "All Chains" : chain.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      <table className="wallet-table">
        <thead>
          <tr>
            <th onClick={() => toggleSort("name")} className="sortable-column">
              <div className="column-header">
                Asset
                {sortField === "name" && (
                  <span className="sort-icon">
                    {sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />}
                  </span>
                )}
              </div>
            </th>
            <th onClick={() => toggleSort("price")} className="sortable-column">
              <div className="column-header">
                Price (USD)
                {sortField === "price" && (
                  <span className="sort-icon">
                    {sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />}
                  </span>
                )}
              </div>
            </th>
            <th
              onClick={() => toggleSort("price_24h_change_percent")}
              className="sortable-column"
            >
              <div className="column-header">
                24h Change
                {sortField === "price_24h_change_percent" && (
                  <span className="sort-icon">
                    {sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />}
                  </span>
                )}
              </div>
            </th>
            <th
              onClick={() => toggleSort("total_amount")}
              className="sortable-column"
            >
              <div className="column-header">
                Holdings
                {sortField === "total_amount" && (
                  <span className="sort-icon">
                    {sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />}
                  </span>
                )}
              </div>
            </th>
            <th
              onClick={() => toggleSort("total_value")}
              className="sortable-column"
            >
              <div className="column-header">
                Value (USD)
                {sortField === "total_value" && (
                  <span className="sort-icon">
                    {sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />}
                  </span>
                )}
              </div>
            </th>
          </tr>
        </thead>
        <tbody>
          {visibleAssets.length > 0 ? (
            visibleAssets.map((asset, index) => (
              <tr
                key={`${asset.symbol}-${asset.chain}-${index}`}
                className="wallet-row"
              >
                <td className="asset-cell">
                  <div className="asset-info">
                    {renderAssetIcon(asset)}
                    <div className="asset-name-container">
                      <span className="asset-name">{asset.name}</span>
                      <div className="asset-details">
                        <span className="asset-symbol">{asset.symbol}</span>
                        {asset.chain && (
                          <span className="asset-chain-badge">
                            {asset.chain.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </td>
                <td>
                  <LivePrice
                    symbol={asset.symbol}
                    showChange={false}
                    size="small"
                    defaultPrice={parseFloat(asset.price)}
                  />
                </td>
                <td>
                  <LivePrice
                    symbol={asset.symbol}
                    showChange={true}
                    showIcon={false}
                    size="small"
                    defaultPrice={parseFloat(asset.price)}
                    defaultChange={parseFloat(asset.price_24h_change_percent)}
                  />
                </td>
                <td>
                  <span className="token-amount">
                    {formatCryptoAmount(asset.total_amount, asset.symbol)}{" "}
                    <span className="token-symbol">{asset.symbol}</span>
                  </span>
                </td>
                <td className="balance-cell">
                  ${formatNumber(asset.total_value)}
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5" className="empty-state-cell">
                <div className="empty-state-container">
                  <div className="empty-message">
                    <svg
                      viewBox="0 0 24 24"
                      width="48"
                      height="48"
                      fill="currentColor"
                    >
                      <path d="M21 5c-1.11-.35-2.33-.5-3.5-.5-1.95 0-4.05.4-5.5 1.5-1.45-1.1-3.55-1.5-5.5-1.5S2.45 4.9 1 6v14.65c0 .25.25.5.5.5.1 0 .15-.05.25-.05C3.1 20.45 5.05 20 6.5 20c1.95 0 4.05.4 5.5 1.5 1.35-.85 3.8-1.5 5.5-1.5 1.65 0 3.35.3 4.75 1.05.1.05.15.05.25.05.25 0 .5-.25.5-.5V6c-.6-.45-1.25-.75-2-1zm0 13.5c-1.1-.35-2.3-.5-3.5-.5-1.7 0-4.15.65-5.5 1.5V8c1.35-.85 3.8-1.5 5.5-1.5 1.2 0 2.4.15 3.5.5v11.5z" />
                    </svg>
                    <p>
                      {searchQuery || selectedChain !== "all"
                        ? "No assets found matching your filters. Try adjusting your search criteria."
                        : "No assets found in your portfolio. Add a wallet to get started."}
                    </p>
                  </div>
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {visibleCount < filteredAssets.length && (
        <button onClick={handleShowMore} className="show-more-button">
          Show more assets ({visibleCount} of {filteredAssets.length})
        </button>
      )}
    </div>
  );
};

AssetTable.propTypes = {
  assets: PropTypes.array,
  isLoading: PropTypes.bool,
  visibleCount: PropTypes.number,
  setVisibleCount: PropTypes.func,
};

export default AssetTable;
