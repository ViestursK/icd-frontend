import React, { useState, useRef, useEffect } from "react";
import { FaWallet } from "react-icons/fa";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import "./WalletForm.css";

export default function WalletForm() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  
  const { 
    supportedChains, 
    loadingChains, 
    addWallet, 
    fetchSupportedChains, 
    isLoading 
  } = useWallet();
  
  // Use the toast hook here, in a component that's within the ToastProvider
  const toast = useToast();
  const formRef = useRef(null);

  // Handle clicks outside the form to collapse it
  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsExpanded(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Load supported chains when form is expanded
  useEffect(() => {
    if (isExpanded && supportedChains.length === 0 && !loadingChains) {
      fetchSupportedChains();
    }
  }, [isExpanded, supportedChains.length, fetchSupportedChains, loadingChains]);

  // Handle click on the form when collapsed
  const handleFormClick = (e) => {
    // Only expand on click if form is not already expanded
    if (!isExpanded) {
      e.preventDefault(); // Prevent form submission
      setIsExpanded(true);
    }
  };

  // Handle form submission
  async function handleSubmit(e) {
    e.preventDefault();

    // Only validate and process if the form is expanded
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    // Validate input
    if (!selectedChain) {
      toast.error("Please select a blockchain");
      return;
    }
    
    if (!walletAddress.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    // Call the addWallet function from context
    const result = await addWallet({
      address: walletAddress.trim(),
      chain: selectedChain,
    });

    if (result.success) {
      // Reset form on success
      setWalletAddress("");
      setSelectedChain("");
      setIsExpanded(false);
      toast.success("Wallet added successfully!");
    } else if (result.error) {
      toast.error(result.error);
    }
  }

  return (
    <div className="wallet-form-container" ref={formRef}>
      <form
        onSubmit={handleSubmit}
        onClick={handleFormClick}
        className={`sliding-form ${isExpanded ? "expanded" : ""}`}
        aria-label="Add wallet form"
      >
        <div className="inputs-container">
          <div className="select-wrapper">
            <label htmlFor="chain-select" className="sr-only">
              Select Blockchain
            </label>
            <select
              id="chain-select"
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              className="chain-select"
              disabled={loadingChains || isLoading}
              aria-busy={loadingChains}
            >
              <option value="">Select Chain</option>
              {supportedChains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name.toUpperCase()}
                </option>
              ))}
            </select>
            {loadingChains && (
              <div className="loading-indicator" aria-hidden="true">
                <span className="loader"></span>
              </div>
            )}
          </div>
          
          <label htmlFor="wallet-input" className="sr-only">
            Wallet Address
          </label>
          <input
            type="text"
            id="wallet-input"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter Wallet Address"
            className="wallet-input"
            disabled={isLoading}
          />
        </div>
        
        <button
          type="submit"
          disabled={isLoading || (isExpanded && !selectedChain && walletAddress.trim().length > 0)}
          className="submit-button"
          aria-label="Add wallet"
        >
          {isLoading ? (
            <div className="button-spinner" aria-hidden="true">
              <FaWallet className="loading-icon" />
            </div>
          ) : (
            "Add Wallet"
          )}
        </button>
      </form>
    </div>
  );
}