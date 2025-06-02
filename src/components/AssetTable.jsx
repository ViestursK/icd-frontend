import React, { useState, useMemo, useCallback } from "react";
import PropTypes from "prop-types";
import {
  FaCaretUp,
  FaCaretDown,
  FaSearch,
  FaTimes,
  FaWallet,
  FaCoins,
} from "react-icons/fa";

import "../styles/tableUtils.css";
import "./AssetTable.css";
import "./skeleton.css";

const AssetTable = ({
  assets = [],
  isLoading,
  visibleCount = 15,
  setVisibleCount,
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState("total_value");
  const [sortDirection, setSortDirection] = useState("desc");
  const [selectedChain, setSelectedChain] = useState("all");

  const uniqueChains = useMemo(() => {
    const chains = assets
      .map((asset) => asset.chain?.toLowerCase())
      .filter(Boolean);
    return ["all", ...new Set(chains)];
  }, [assets]);

  const formatNumber = (num, decimalPlaces = 2) => {
    const val = parseFloat(num);
    if (isNaN(val)) return "0.00";
    return val.toLocaleString("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  const formatCryptoAmount = (amount, symbol) => {
    const dp = ["BTC", "ETH", "WBTC"].includes(symbol?.toUpperCase()) ? 6 : 3;
    return formatNumber(amount, dp);
  };

  const formatPercentChange = (change) => {
    const val = parseFloat(change);
    if (isNaN(val)) return "0.00%";
    return `${val >= 0 ? "+" : ""}${val.toFixed(2)}%`;
  };

  const getChangeIcon = (percent) => {
    const val = parseFloat(percent);
    if (val > 0) return <FaCaretUp className="change-icon up" />;
    if (val < 0) return <FaCaretDown className="change-icon down" />;
    return null;
  };

  const renderAssetIcon = (asset) => {
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
            {asset.symbol?.[0]}
          </span>
        </>
      );
    }
    return (
      <span className={`asset-icon ${symbolClass}`}>{asset.symbol?.[0]}</span>
    );
  };

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesSearch =
        asset.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.symbol?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        asset.chain?.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesChain =
        selectedChain === "all" || asset.chain?.toLowerCase() === selectedChain;

      return matchesSearch && matchesChain;
    });
  }, [assets, searchQuery, selectedChain]);

  const sortedAssets = useMemo(() => {
    return [...filteredAssets].sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (
        [
          "price",
          "price_24h_change_percent",
          "total_amount",
          "total_value",
        ].includes(sortField)
      ) {
        aVal = parseFloat(aVal) || 0;
        bVal = parseFloat(bVal) || 0;
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      return 0;
    });
  }, [filteredAssets, sortField, sortDirection]);

  const visibleAssets = useMemo(() => {
    return sortedAssets.slice(0, visibleCount);
  }, [sortedAssets, visibleCount]);

  const toggleSort = useCallback(
    (field) => {
      if (sortField === field) {
        setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
      } else {
        setSortField(field);
        setSortDirection("desc");
      }
    },
    [sortField]
  );

  const clearSearch = useCallback(() => {
    setSearchQuery("");
  }, []);

  const handleShowMore = () => setVisibleCount((prev) => prev + 10);

  if (isLoading) {
    return <div className="data-table-container shimmer-loading"></div>;
  }

  return (
    <div className="data-table-container">
      {/* Only show controls if there are assets */}
      {assets.length > 0 && (
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
                Showing {Math.min(visibleAssets.length, filteredAssets.length)}{" "}
                of {filteredAssets.length} assets
                {searchQuery && ` matching "${searchQuery}"`}
                {selectedChain !== "all" &&
                  ` on ${selectedChain.toUpperCase()}`}
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
      )}

      <table className="data-table">
        {filteredAssets.length > 0 && (
          <thead>
            <tr>
              {[
                { label: "Asset", field: "name" },
                { label: "Price (USD)", field: "price" },
                { label: "24h Change", field: "price_24h_change_percent" },
                { label: "Holdings", field: "total_amount" },
                { label: "Value (USD)", field: "total_value" },
              ].map(({ label, field }) => (
                <th
                  key={field}
                  onClick={() => toggleSort(field)}
                  className="sortable-column"
                >
                  <div className="column-header">
                    {label}
                    {sortField === field && (
                      <span className="sort-icon">
                        {sortDirection === "asc" ? (
                          <FaCaretUp />
                        ) : (
                          <FaCaretDown />
                        )}
                      </span>
                    )}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
        )}
        <tbody>
          {visibleAssets.length > 0 ? (
            visibleAssets.map((asset, idx) => (
              <tr key={asset.symbol + idx}>
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
                <td>${formatNumber(asset.price)}</td>
                <td>
                  <div
                    className={`price-change-container ${
                      parseFloat(asset.price_24h_change_percent) >= 0
                        ? "positive-change"
                        : "negative-change"
                    }`}
                  >
                    {getChangeIcon(asset.price_24h_change_percent)}
                    <span>
                      {formatPercentChange(asset.price_24h_change_percent)}
                    </span>
                  </div>
                </td>
                <td>
                  {formatCryptoAmount(asset.total_amount, asset.symbol)}{" "}
                  {asset.symbol}
                </td>
                <td>${formatNumber(asset.total_value)}</td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={5} className="empty-state-cell">
                <div className="empty-state-container">
                  {searchQuery || selectedChain !== "all" ? (
                    <div className="empty-state">
                      <FaSearch className="empty-state-icon" size={48} />
                      <p className="empty-state-text">
                        No assets match your filters
                      </p>
                    </div>
                  ) : (
                    <div className="empty-state">
                      <FaCoins className="empty-state-icon" size={48} />
                      <p className="empty-state-text">
                        No wallet data available
                      </p>
                    </div>
                  )}
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
