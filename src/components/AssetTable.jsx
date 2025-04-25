import React from "react";
import PropTypes from "prop-types";
import { FaCaretUp, FaCaretDown } from "react-icons/fa";
import "./WalletTable.css";
import "./AssetTable.css";
import "./skeleton.css";

const AssetTable = ({ assets = [], isLoading }) => {
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortField, setSortField] = React.useState("name"); // default to name
  const [sortDirection, setSortDirection] = React.useState("asc");
  const [visibleCount, setVisibleCount] = React.useState(8);
  const [selectedChain, setSelectedChain] = React.useState("all");

  const formatNumber = (number, decimalPlaces = 2) => {
    if (!number || isNaN(parseFloat(number))) return "0.00";
    return parseFloat(number).toLocaleString("en-US", {
      minimumFractionDigits: decimalPlaces,
      maximumFractionDigits: decimalPlaces,
    });
  };

  const formatCryptoAmount = (amount, symbol) => {
    const decimalPlaces = ["BTC", "ETH", "WBTC"].includes(symbol) ? 6 : 2;
    return formatNumber(amount, decimalPlaces);
  };

  const getChangeIcon = (changePercent) => {
    const numericChange = parseFloat(changePercent);
    if (numericChange > 0) return <FaCaretUp className="change-icon up" />;
    if (numericChange < 0) return <FaCaretDown className="change-icon down" />;
    return null;
  };

  const formatPercentChange = (change) => {
    const numericChange = parseFloat(change);
    const sign = numericChange >= 0 ? "+" : "";
    return `${sign}${numericChange.toFixed(2)}%`;
  };

  const renderAssetIcon = (asset) => {
    const symbolClass = asset.symbol.toLowerCase();
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
          <span className={`asset-icon ${symbolClass}`} style={{ display: "none" }}>
            {asset.symbol.substring(0, 1)}
          </span>
        </>
      );
    }
    return (
      <span className={`asset-icon ${symbolClass}`}>
        {asset.symbol.substring(0, 1)}
      </span>
    );
  };

  const filteredAssets = assets.filter((asset) => {
    const matchesSearch =
      asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesChain =
      selectedChain === "all" ||
      asset.chain?.toLowerCase() === selectedChain.toLowerCase();

    return matchesSearch && matchesChain;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    if (!sortField) return 0;

    let aValue = a[sortField];
    let bValue = b[sortField];

    // Handle numbers
    if (
      ["price", "price_24h_change_percent", "total_amount", "total_value"].includes(sortField)
    ) {
      aValue = parseFloat(aValue);
      bValue = parseFloat(bValue);
      if (isNaN(aValue) || isNaN(bValue)) return 0;
      return sortDirection === "asc" ? aValue - bValue : bValue - aValue;
    }

    // Handle strings (e.g., name)
    if (typeof aValue === "string" && typeof bValue === "string") {
      return sortDirection === "asc"
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue);
    }

    return 0;
  });

  const visibleAssets = sortedAssets.slice(0, visibleCount);

  const toggleSort = (field) => {
    if (sortField === field) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  return (
    <div className="wallet-table-container" role="region" aria-label="Asset holdings">
      <div className="table-controls">
        <input
          type="text"
          placeholder="Search assets..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="search-input"
        />

        <div className="filter-buttons">
          {["all", "btc", "eth", "usdt", "usdc", "bnb", "sol", "pol"].map((chain) => (
            <button
              key={chain}
              className={`filter-button ${selectedChain === chain ? "active" : ""}`}
              onClick={() => setSelectedChain(chain)}
            >
              {chain.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <table className="wallet-table">
          <thead></thead>
          <tbody></tbody>
        </table>
      ) : (
        <table className="wallet-table">
          <thead>
            <tr>
              <th onClick={() => toggleSort("name")}>
                Asset
                {sortField === "name" &&
                  (sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />)}
              </th>
              <th onClick={() => toggleSort("price")}>
                Price (USD)
                {sortField === "price" &&
                  (sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />)}
              </th>
              <th onClick={() => toggleSort("price_24h_change_percent")}>
                24h Change
                {sortField === "price_24h_change_percent" &&
                  (sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />)}
              </th>
              <th onClick={() => toggleSort("total_amount")}>
                Holdings
                {sortField === "total_amount" &&
                  (sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />)}
              </th>
              <th onClick={() => toggleSort("total_value")}>
                Value (USD)
                {sortField === "total_value" &&
                  (sortDirection === "asc" ? <FaCaretUp /> : <FaCaretDown />)}
              </th>
            </tr>
          </thead>
          <tbody>
            {visibleAssets.length > 0 ? (
              visibleAssets.map((asset, index) => (
                <tr key={index} className="wallet-row">
                  <td className="asset-cell">
                    <div className="asset-info">
                      {renderAssetIcon(asset)}
                      <div className="asset-name-container">
                        <span className="asset-name">{asset.name}</span>
                        <span className="asset-symbol">{asset.symbol}</span>
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
                      <span>{formatPercentChange(asset.price_24h_change_percent)}</span>
                    </div>
                  </td>
                  <td>
                    {formatCryptoAmount(asset.total_amount, asset.symbol)} {asset.symbol}
                  </td>
                  <td className="balance-cell">${formatNumber(asset.total_value)}</td>
                </tr>
              ))
            ) : (
              <tr className="empty-state">
                <td colSpan="5">No assets found.</td>
              </tr>
            )}

            {visibleCount < sortedAssets.length && (
              <tr>
                <td colSpan="5" style={{ textAlign: "center" }}>
                  <button
                    onClick={() => setVisibleCount((prev) => prev + 8)}
                    className="show-more-button"
                  >
                    Show more
                  </button>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      )}
    </div>
  );
};

AssetTable.propTypes = {
  assets: PropTypes.array,
  isLoading: PropTypes.bool,
};

export default AssetTable;
