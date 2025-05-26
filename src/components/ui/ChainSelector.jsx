import React, { useState, useRef, useEffect } from "react";
import { FaChevronDown, FaChevronUp, FaCheck } from "react-icons/fa";
import "./ChainSelector.css";

const ChainSelector = ({
  chains = [],
  selectedChain,
  onChainSelect,
  isLoading = false,
  disabled = false,
  placeholder = "Select Network",
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Handle chain selection
  const handleSelectChain = (chain) => {
    setIsOpen(false);
    onChainSelect(chain.id);
  };

  // Toggle dropdown
  const toggleDropdown = () => {
    if (!disabled && !isLoading) {
      setIsOpen(!isOpen);
    }
  };

  // Get selected chain data
  const selectedChainData = chains.find((c) => c.id === selectedChain);

  // Get chain badge
  const getChainBadge = (chain) => (
    <span className={`chain-badge ${chain.id.toLowerCase()}`}>
      {chain.name.substring(0, 1).toUpperCase()}
    </span>
  );

  return (
    <div className="chain-selector" ref={dropdownRef}>
      <button
        type="button"
        className={`chain-selector-toggle ${isOpen ? "open" : ""} ${
          disabled ? "disabled" : ""
        }`}
        onClick={toggleDropdown}
        disabled={disabled}
      >
        {selectedChainData ? (
          <>
            {getChainBadge(selectedChainData)}
            <span className="chain-name">
              {selectedChainData.name.toUpperCase()}
            </span>
          </>
        ) : (
          <span className="chain-placeholder">
            {isLoading ? "Loading networks..." : placeholder}
          </span>
        )}

        {isLoading ? (
          <span className="chain-loading-spinner"></span>
        ) : isOpen ? (
          <FaChevronUp />
        ) : (
          <FaChevronDown />
        )}
      </button>

      {isOpen && !isLoading && (
        <div className="chain-dropdown">
          <div className="chain-dropdown-header">
            <span>Select Network</span>
          </div>

          {chains.length > 0 ? (
            chains.map((chain) => (
              <div
                key={chain.id}
                className={`chain-option ${
                  selectedChain === chain.id ? "active" : ""
                }`}
                onClick={() => handleSelectChain(chain)}
              >
                {getChainBadge(chain)}
                <div className="chain-details">
                  <span className="chain-option-name">
                    {chain.name.toUpperCase()}
                  </span>
                  <span className="chain-option-desc">
                    {chain.name} blockchain network
                  </span>
                </div>
                {selectedChain === chain.id && (
                  <FaCheck className="chain-check" />
                )}
              </div>
            ))
          ) : (
            <div className="chain-empty">
              <span>No networks available</span>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChainSelector;
