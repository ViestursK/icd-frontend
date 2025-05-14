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

    setConnectingWallet(true);

    try {
      // Call the addWallet function from context
      const result = await addWallet({
        address: walletAddress.trim(),
        chain: selectedChain,
      });

      if (result.success) {
        // Reset form on success
        setWalletAddress("");
        setSelectedChain("");
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

            <div className="wallet-modal-tabs">
              <button
                className={`wallet-modal-tab ${
                  activeTab === "wallet-connect" ? "active" : ""
                }`}
                onClick={() => handleTabChange("wallet-connect")}
              >
                <FaWallet className="tab-icon" />
                <span className="tab-text">Connect</span>
              </button>
              <button
                className={`wallet-modal-tab ${
                  activeTab === "exchanges" ? "active" : ""
                }`}
                onClick={() => handleTabChange("exchanges")}
              >
                <FaExchangeAlt className="tab-icon" />
                <span className="tab-text">Exchanges</span>
              </button>
              <button
                className={`wallet-modal-tab ${
                  activeTab === "manual" ? "active" : ""
                }`}
                onClick={() => handleTabChange("manual")}
              >
                <FaEdit className="tab-icon" />
                <span className="tab-text">Manual</span>
              </button>
            </div>

            <div className="wallet-modal-content">
              {/* Wallet Connect Tab */}
              {activeTab === "wallet-connect" && (
                <div className="wallet-connect-options">
                  <button
                    className="wallet-connect-option metamask"
                    onClick={() => handleConnectWallet("MetaMask")}
                    disabled={connectingWallet}
                  >
                    <div className="wallet-option-icon metamask">
                      <img
                        src="https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg"
                        alt="MetaMask"
                      />
                    </div>
                    <div className="wallet-option-details">
                      <span className="wallet-option-name">MetaMask</span>
                      <span className="wallet-option-desc">
                        Connect MetaMask wallet
                      </span>
                    </div>
                    <FaChevronRight className="wallet-option-arrow" />
                  </button>

                  <button
                    className="wallet-connect-option walletconnect"
                    onClick={() => handleConnectWallet("WalletConnect")}
                    disabled={connectingWallet}
                  >
                    <div className="wallet-option-icon walletconnect">
                      <svg viewBox="0 0 512 512" height="100%" width="100%">
                        <path
                          d="M169.2,170.3c48-47.9,125.8-47.9,173.8,0l5.8,5.8c2.4,2.4,2.4,6.2,0,8.6l-19.8,19.8c-1.2,1.2-3.1,1.2-4.3,0l-8-8c-33.5-33.5-87.8-33.5-121.3,0l-8.6,8.6c-1.2,1.2-3.1,1.2-4.3,0l-19.8-19.8c-2.4-2.4-2.4-6.2,0-8.6L169.2,170.3z M394.5,214.5l17.6,17.6c2.4,2.4,2.4,6.2,0,8.6L302.9,350c-1.2,1.2-3.1,1.2-4.3,0l-64-64c-0.6-0.6-1.5-0.6-2.1,0l-64,64c-1.2,1.2-3.1,1.2-4.3,0L54.9,240.8c-2.4-2.4-2.4-6.2,0-8.6l17.6-17.6c1.2-1.2,3.1-1.2,4.3,0l64,64c0.6,0.6,1.5,0.6,2.1,0l64-64c1.2-1.2,3.1-1.2,4.3,0l64,64c0.6,0.6,1.5,0.6,2.1,0l64-64C391.4,213.3,393.3,213.3,394.5,214.5z"
                          fill="#3b99fc"
                        />
                      </svg>
                    </div>
                    <div className="wallet-option-details">
                      <span className="wallet-option-name">WalletConnect</span>
                      <span className="wallet-option-desc">
                        Scan QR code to connect
                      </span>
                    </div>
                    <FaChevronRight className="wallet-option-arrow" />
                  </button>

                  <button
                    className="wallet-connect-option rainbow"
                    onClick={() => handleConnectWallet("Rainbow")}
                    disabled={connectingWallet}
                  >
                    <div className="wallet-option-icon rainbow">
                      <FaEthereum />
                    </div>
                    <div className="wallet-option-details">
                      <span className="wallet-option-name">Rainbow</span>
                      <span className="wallet-option-desc">
                        Connect Rainbow wallet
                      </span>
                    </div>
                    <FaChevronRight className="wallet-option-arrow" />
                  </button>

                  <button
                    className="wallet-connect-option trust"
                    onClick={() => handleConnectWallet("Trust Wallet")}
                    disabled={connectingWallet}
                  >
                    <div className="wallet-option-icon trust">
                      <FaCoins />
                    </div>
                    <div className="wallet-option-details">
                      <span className="wallet-option-name">Trust Wallet</span>
                      <span className="wallet-option-desc">
                        Connect Trust Wallet
                      </span>
                    </div>
                    <FaChevronRight className="wallet-option-arrow" />
                  </button>
                </div>
              )}

              {/* Exchanges Tab */}
              {activeTab === "exchanges" && (
                <div className="wallet-connect-options">
                  <button
                    className="wallet-connect-option binance"
                    onClick={() => handleConnectExchange("Binance")}
                    disabled={connectingWallet}
                  >
                    <div className="wallet-option-icon binance">
                      <SiBinance />
                    </div>
                    <div className="wallet-option-details">
                      <span className="wallet-option-name">Binance</span>
                      <span className="wallet-option-desc">
                        Connect Binance account
                      </span>
                    </div>
                    <FaChevronRight className="wallet-option-arrow" />
                  </button>

                  <button
                    className="wallet-connect-option coinbase"
                    onClick={() => handleConnectExchange("Coinbase")}
                    disabled={connectingWallet}
                  >
                    <div className="wallet-option-icon coinbase">
                      <SiCoinbase />
                    </div>
                    <div className="wallet-option-details">
                      <span className="wallet-option-name">Coinbase</span>
                      <span className="wallet-option-desc">
                        Connect Coinbase account
                      </span>
                    </div>
                    <FaChevronRight className="wallet-option-arrow" />
                  </button>

                  <button
                    className="wallet-connect-option kraken"
                    onClick={() => handleConnectExchange("Kraken")}
                    disabled={connectingWallet}
                  >
                    <div className="wallet-option-icon kraken">
                      <svg viewBox="0 0 24 24" width="100%" height="100%">
                        <path
                          d="M12 24c6.627 0 12-5.373 12-12S18.627 0 12 0 0 5.373 0 12s5.373 12 12 12z"
                          fill="#5741d9"
                        />
                        <path
                          d="M4.5 10.5h3v3h-3v-3zm0-3h3v-3h-3v3zm12 12h3v-3h-3v3zm-3-3h3v-3h-3v3zm3-3h3v-3h-3v3zm0-6h3v-3h-3v3zm-9 9h3v-3h-3v3z"
                          fill="#fff"
                        />
                      </svg>
                    </div>
                    <div className="wallet-option-details">
                      <span className="wallet-option-name">Kraken</span>
                      <span className="wallet-option-desc">
                        Connect Kraken account
                      </span>
                    </div>
                    <FaChevronRight className="wallet-option-arrow" />
                  </button>
                </div>
              )}

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
