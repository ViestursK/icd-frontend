import { useState, useRef, useEffect } from "react";
import { FaWallet } from "react-icons/fa";
import api from "../api/api";
import "./WalletForm.css";

export default function WalletForm({ setWallets }) {
  const [isHovered, setIsHovered] = useState(false);
  const [walletAddress, setWalletAddress] = useState("");
  const [selectedChain, setSelectedChain] = useState("");
  const [supportedChains, setSupportedChains] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetchingChains, setFetchingChains] = useState(false);
  const [error, setError] = useState("");
  const formRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (formRef.current && !formRef.current.contains(event.target)) {
        setIsHovered(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  useEffect(() => {
    const fetchSupportedChains = async () => {
      const cachedChains = localStorage.getItem("supportedChains");
      const cacheTimestamp = localStorage.getItem("supportedChainsTimestamp");
      const cacheExpiration = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

      if (
        cachedChains &&
        cacheTimestamp &&
        Date.now() - parseInt(cacheTimestamp) < cacheExpiration
      ) {
        setSupportedChains(JSON.parse(cachedChains));
        return;
      }

      setFetchingChains(true);
      try {
        const response = await api.get("/api/wallets/supported_chains/");
        const chains = response.data.supported_chains;

        localStorage.setItem("supportedChains", JSON.stringify(chains));
        localStorage.setItem("supportedChainsTimestamp", Date.now().toString());

        setSupportedChains(chains);
      } catch (err) {
        console.error("Failed to fetch supported chains:", err);
        if (cachedChains) {
          setSupportedChains(JSON.parse(cachedChains));
        }
      } finally {
        setFetchingChains(false);
      }
    };

    if (isHovered && supportedChains.length === 0) {
      fetchSupportedChains();
    }
  }, [isHovered]);

  // Handle the form submission
  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Post the wallet data to the backend API
      const response = await api.post("/api/wallets/add/", {
        address: walletAddress,
        chain: selectedChain,
      });

      // Assuming the response contains the new wallet data
      const newWallet = response.data;

      console.log("Wallet added successfully:", newWallet);

      // Add the new wallet to the existing wallets list in state
      setWallets((prevWallets) => {
        const updatedWallets = [...prevWallets, newWallet];
        // Cache the updated wallets in localStorage
        localStorage.setItem("wallets", JSON.stringify(updatedWallets));
        return updatedWallets;
      });

      // Clear form inputs
      setWalletAddress("");
      setSelectedChain("");
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || err.message || "Failed to add wallet";
      setError(errorMessage);
      console.error("Error adding wallet:", err);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="wallet-form-container" ref={formRef}>
      <form
        onSubmit={handleSubmit}
        className={`sliding-form ${isHovered ? "expanded" : ""}`}
        onMouseEnter={() => setIsHovered(true)}
      >
        <div className="inputs-container">
          <div className="select-wrapper">
            <select
              id="chain-select"
              value={selectedChain}
              onChange={(e) => setSelectedChain(e.target.value)}
              required
              className="chain-select"
              disabled={fetchingChains}
            >
              <option value="">Select a Chain</option>
              {supportedChains.map((chain) => (
                <option key={chain.id} value={chain.id}>
                  {chain.name.toUpperCase()}
                </option>
              ))}
            </select>
            {fetchingChains && (
              <div className="loading-indicator">
                <span className="loader"></span>
              </div>
            )}
          </div>
          <input
            type="text"
            id="wallet-input"
            value={walletAddress}
            onChange={(e) => setWalletAddress(e.target.value)}
            placeholder="Enter Wallet Address"
            required
            className="wallet-input"
          />
        </div>
        <button
          type="submit"
          disabled={loading || !selectedChain}
          className="submit-button"
        >
          {loading ? <FaWallet className="loading-icon" /> : "Add Wallet"}
        </button>
      </form>
      {error && <p className="error-message">{error}</p>}
    </div>
  );
}
