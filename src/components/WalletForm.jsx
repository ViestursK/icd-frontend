// Optimized WalletForm.jsx - Fixed for immediate visibility
import { useState, useRef, useEffect } from "react";
import { FaWallet, FaTimes, FaPlus, FaTag } from "react-icons/fa";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import ChainSelector from "./ui/ChainSelector";
import "./WalletForm.css";

export default function WalletForm() {
  // State for modal visibility
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form states
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [walletName, setWalletName] = useState("");

  // Loading state
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get wallet context and toast
  const { supportedChains, loadingChains, addWallet, fetchSupportedChains } =
    useWallet();

  const toast = useToast();
  const modalRef = useRef(null);

  // Handle clicks outside the modal to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        closeModal();
      }
    }

    if (isModalOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      // Prevent body scroll when modal is open
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "unset";
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
    setWalletName("");
  };

  // Generate a default wallet name based on chain and address
  const generateDefaultWalletName = () => {
    if (selectedChain && walletAddress) {
      const chainName = selectedChain.toUpperCase();
      const addressShort = `${walletAddress.substring(
        0,
        4
      )}...${walletAddress.substring(walletAddress.length - 4)}`;
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

  // Handle form submission
  const handleSubmit = async (e) => {
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

    setIsSubmitting(true);

    try {
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
      setIsSubmitting(false);
    }
  };

  // Handle escape key to close modal
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === "Escape" && isModalOpen) {
        closeModal();
      }
    };

    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [isModalOpen]);

  return (
    <>
      {/* Add Wallet Button - Always visible */}
      <button
        className="add-wallet-button"
        onClick={openModal}
        aria-label="Add wallet"
        style={{ opacity: 1, visibility: "visible" }}
      >
        <FaPlus className="add-icon" />
        <span className="add-text">Add Wallet</span>
      </button>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="wallet-modal-overlay">
          <div className="wallet-modal-container" ref={modalRef}>
            {/* Modal Header */}
            <div className="wallet-modal-header">
              <h3>Add New Wallet</h3>
              <button
                className="wallet-modal-close-button"
                onClick={closeModal}
                aria-label="Close modal"
                disabled={isSubmitting}
              >
                <FaTimes />
              </button>
            </div>

            {/* Modal Content - Manual Form Only */}
            <div className="wallet-modal-content">
              <form className="wallet-manual-form" onSubmit={handleSubmit}>
                {/* Blockchain Selection */}
                <div className="form-group">
                  <label htmlFor="chain-select">Blockchain Network</label>
                  <ChainSelector
                    chains={supportedChains}
                    selectedChain={selectedChain}
                    onChainSelect={setSelectedChain}
                    isLoading={loadingChains}
                    disabled={isSubmitting}
                    placeholder="Select Network"
                  />
                </div>

                {/* Wallet Address */}
                <div className="form-group">
                  <label htmlFor="wallet-address">Wallet Address</label>
                  <div className="input-wrapper">
                    <FaWallet className="input-icon" />
                    <input
                      type="text"
                      id="wallet-address"
                      value={walletAddress}
                      onChange={(e) => setWalletAddress(e.target.value)}
                      placeholder="Enter wallet address (0x...)"
                      className="form-input with-icon"
                      disabled={isSubmitting}
                      required
                    />
                  </div>
                </div>

                {/* Wallet Name */}
                <div className="form-group">
                  <label htmlFor="wallet-name">
                    Wallet Name <span className="optional">(optional)</span>
                  </label>
                  <div className="input-wrapper">
                    <FaTag className="input-icon" />
                    <input
                      type="text"
                      id="wallet-name"
                      value={walletName}
                      onChange={(e) => setWalletName(e.target.value)}
                      placeholder="Enter a custom name"
                      className="form-input with-icon"
                      disabled={isSubmitting}
                      maxLength={30}
                    />
                  </div>
                  <p className="form-hint">
                    A custom name helps you identify this wallet easily.
                  </p>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  className="wallet-submit-button"
                  disabled={
                    isSubmitting || !selectedChain || !walletAddress.trim()
                  }
                >
                  {isSubmitting ? (
                    <>
                      <span className="button-spinner">
                        <FaWallet className="spinning-icon" />
                      </span>
                      Adding Wallet...
                    </>
                  ) : (
                    <>
                      <FaPlus />
                      Add Wallet
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
