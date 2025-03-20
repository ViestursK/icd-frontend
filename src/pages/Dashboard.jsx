import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import BalanceCard from "../components/BalanceCard";
import WalletForm from "../components/WalletForm";
import WalletTable from "../components/WalletTable";
import api from "../api/api";
import RefreshButton from "../components/RefreshButton";
import "./Dashboard.css";

function Dashboard() {
  const [wallets, setWallets] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  // Load wallets from cache if available
  const loadCachedWallets = () => {
    const cachedWallets = localStorage.getItem("wallets");
    if (cachedWallets) {
      const walletsData = JSON.parse(cachedWallets);
      setWallets(walletsData);
      setLoading(false);
      return true; // Cache was loaded
    }
    return false; // No cached wallets
  };

  // Fetch wallets from the backend and update cache
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/wallets/sync/");
      const fetchedWallets = response.data.wallets;
      setWallets(fetchedWallets);
      localStorage.setItem("wallets", JSON.stringify(fetchedWallets));
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  // On mount, load cache; if not present, fetch from backend
  useEffect(() => {
    const cacheExists = loadCachedWallets();
    if (!cacheExists) {
      fetchWallets();
    }
  }, []);

  // Calculate total wallet balance whenever wallets change
  useEffect(() => {
    const totalBalance = wallets.reduce((acc, wallet) => {
      // Convert balance_usd to a number and sum it up
      return acc + parseFloat(wallet.balance_usd || 0);
    }, 0);
    setWalletBalance(totalBalance.toFixed(2));
  }, [wallets]);

  // This function is used for manual refresh or after adding a wallet.
  const handleRefresh = () => {
    fetchWallets();
  };

  return (
    <div className="dashboard-container">
      <div className="top-container">
        <Header prop="DASHBOARD" />
        {/* Pass a callback to WalletForm so it can trigger a refresh after a wallet is added */}
        <WalletForm setWallets={setWallets} onWalletAdded={handleRefresh} />
      </div>
      <h2>Portfolio</h2>
      <div className="container">
        <div className="stat-container">
          {/* Show the summed balance from cached data */}
          <BalanceCard balance={walletBalance} changePercent={0.3} />
        </div>
        <div className="holdings-container">
          <h3>Crypto Wallets</h3>
          <WalletTable wallets={wallets} isLoading={loading} />
          <RefreshButton onRefresh={handleRefresh} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
