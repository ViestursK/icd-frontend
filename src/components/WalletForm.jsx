// Modified WalletForm.jsx to include name field
import React, { useState, useRef, useEffect } from "react";
import {
  FaWallet,
  FaTimes,
  FaPlus,
  FaExchangeAlt,
  FaEdit,
  FaEthereum,
  FaCoins,
  FaChevronRight,
  FaTag,
} from "react-icons/fa";
import { SiBinance, SiCoinbase } from "react-icons/si";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import "./WalletForm.css";

export default function WalletForm() {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);
  // State for active tab
  const [activeTab, setActiveTab] = useState("wallet-connect");
  // Form states for manual wallet addition
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [walletName, setWalletName] = useState(""); // New state for wallet name
  // Loading states
  const [connectingWallet, setConnectingWallet] = useState(false);

  // Get wallet context and toast
  const {
    supportedChains,
    loadingChains,
    addWallet,
    fetchSupportedChains,
    isLoading,
  } = useWallet();

  const toast = useToast();
  const modalRef = useRef(null);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        setIsModalOpen(false);
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isModalOpen]);

  // Load supported chains when modal opens
  useEffect(() => {
    if (isModalOpen && supportedChains.length === 0 && !loadingChains) {
      fetchSupportedChains();
    }
  }, [
    isModalOpen,
    supportedChains.length,
    fetchSupportedChains,
    loadingChains,
  ]);

  // Open the modal
  const openModal = () => {
    setIsModalOpen(true);
  };

  // Close the modal and reset form
  const closeModal = () => {
    setIsModalOpen(false);
    setWalletAddress("");
    setSelectedChain("");
    setWalletName(""); // Reset wallet name
    setActiveTab("wallet-connect");
  };

  // Handle tab change
  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  // Simulate wallet connection
  const handleConnectWallet = async (type) => {
    setConnectingWallet(true);

    // Simulate connection delay
    setTimeout(() => {
      setConnectingWallet(false);
      toast.info(`${type} connection not implemented in this demo.`);
    }, 1500);
  };

  // Handle exchange connection
  const handleConnectExchange = async (exchange) => {
    setConnectingWallet(true);

    // Simulate connection delay
    setTimeout(() => {
      setConnectingWallet(false);
      toast.info(`${exchange} connection not implemented in this demo.`);
    }, 1500);
  };

  // Generate a default wallet name based on chain and address
  const generateDefaultWalletName = () => {
    if (selectedChain && walletAddress) {
      const chainName = selectedChain.toUpperCase();
      const addressShort = `${walletAddress.substring(0, 4)}...${walletAddress.substring(
        walletAddress.length - 4
      )}`;
      return `${chainName} ${addressShort}`;
    }
    return "";
  };

  // Auto-fill wallet name when address and chain are set
  useEffect(() => {
    if (selectedChain && walletAddress && !walletName) {
      setWalletName(generateDefaultWalletName());
    }
  }, [selectedChain, walletAddress, walletName]);

  // Handle manual form submission
  const handleSubmitManual = async (e) => {
    e.preventDefault();

    // Validate input
    if (!selectedChain) {
      toast.error("Please select a blockchain");
      return;
    }

    if (!walletAddress.trim()) {
      toast.error("Please enter a wallet address");
      return;
    }

    // Use default name if none provided
    const nameToUse = walletName.trim() || generateDefaultWalletName();

    setConnectingWallet(true);

    try {
      // Call the addWallet function from context with the new name parameter
      const result = await addWallet({
        address: walletAddress.trim(),
        chain: selectedChain,
        name: nameToUse,
      });

      if (result.success) {
        // Reset form on success
        setWalletAddress("");
        setSelectedChain("");
        setWalletName("");
        closeModal();
        toast.success("Wallet added successfully!");
      } else if (result.error) {
        toast.error(result.error);
      }
    } catch (error) {
      toast.error("Failed to add wallet. Please try again.");
    } finally {
      setConnectingWallet(false);
    }
  };

  return (
    <>
      {/* Add Wallet Button - Compact for mobile */}
      <button
        className="add-wallet-button"
        onClick={openModal}
        aria-label="Add wallet"
      >
        <FaPlus className="add-icon" />
        <span className="add-text">Add Wallet</span>
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal-container" ref={modalRef}>
            <div className="wallet-modal-header">
              <div className="wallet-modal-handle"></div>
              <h3>Add Wallet</h3>
              <button
                className="wallet-modal-close-button"
                onClick={closeModal}
                aria-label="Close modal"
              >
                <FaTimes />
              </button>
            </div>

            <div className="wallet-modal-content">
              {/* Manual Input Tab */}
              {activeTab === "manual" && (
                <form
                  className="wallet-manual-form"
                  onSubmit={handleSubmitManual}
                >
                  <div className="form-group">
                    <label htmlFor="manual-chain-select">Blockchain</label>
                    <select
                      id="manual-chain-select"
                      value={selectedChain}
                      onChange={(e) => setSelectedChain(e.target.value)}
                      className="form-select"
                      disabled={loadingChains || connectingWallet}
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

                  <div className="form-group">
                    <label htmlFor="manual-wallet-input">Wallet Address</label>
                    <input
                      type="text"
                      id="manual-wallet-input"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter wallet address"
                      className="form-input"
                      disabled={connectingWallet}
                    />
                  </div>

                  {/* New wallet name field */}
                  <div className="form-group">
                    <label htmlFor="wallet-name-input">
                      Wallet Name (optional)
                    </label>
                    <div className="input-wrapper">
                      <FaTag className="input-icon" />
                      <input
                        type="text"
                        id="wallet-name-input"
                        value={walletName}
                        onChange={(e) => setWalletName(e.target.value)}
                        placeholder="Enter a name for this wallet"
                        className="form-input with-icon"
                        disabled={connectingWallet}
                      />
                    </div>
                    <p className="form-hint">
                      A name helps you identify this wallet more easily.
                    </p>
                  </div>

                  <button
                    type="submit"
                    className="wallet-submit-button"
                    disabled={
                      connectingWallet ||
                      !selectedChain ||
                      !walletAddress.trim()
                    }
                  >
                    {connectingWallet ? (
                      <>
                        <span className="button-spinner">
                          <FaWallet className="spinning-icon" />
                        </span>
                        Adding...
                      </>
                    ) : (
                      "Add Wallet"
                    )}
                  </button>
                </form>
              )}
            </div>

            {connectingWallet && (
              <div className="connecting-overlay">
                <div className="connecting-spinner">
                  <FaWallet className="spinning-icon" />
                </div>
                <p>Connecting...</p>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}