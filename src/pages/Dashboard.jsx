import React, { useState, useEffect } from "react";
import Header from "../components/Header";
import BalanceCard from "../components/BalanceCard";
import WalletForm from "../components/WalletForm";
import WalletTable from "../components/WalletTable";
import api from "../api/api";
import RefreshButton from "../components/RefreshButton";
import "./Dashboard.css";
import { getUserIdFromToken } from "../utils/auth";

const CACHE_EXPIRATION = 15 * 60 * 1000; // 15 minutes

function Dashboard() {
  const [wallets, setWallets] = useState([]);
  const [walletBalance, setWalletBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  const accessToken = localStorage.getItem("access_token");
  const userId = getUserIdFromToken(accessToken);
  const walletsCacheKey = `wallets_${userId}`;

  const loadCachedWallets = () => {
    const cachedData = localStorage.getItem(walletsCacheKey);
    if (cachedData) {
      const { timestamp, data } = JSON.parse(cachedData);
      if (Date.now() - timestamp < CACHE_EXPIRATION) {
        setWallets(data);
        setLoading(false);
        return true; // Valid cache loaded
      } else {
        localStorage.removeItem(walletsCacheKey); // Remove expired cache
      }
    }
    return false; // No valid cache
  };

  // Fetch wallets from the backend and update cache
  const fetchWallets = async () => {
    setLoading(true);
    try {
      const response = await api.get("/api/wallets/sync/");
      const fetchedWallets = response.data.wallets;
      setWallets(fetchedWallets);
      // Save cache with timestamp
      localStorage.setItem(
        walletsCacheKey,
        JSON.stringify({
          timestamp: Date.now(),
          data: fetchedWallets,
        })
      );
    } catch (error) {
      console.error("Error fetching wallets:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const cacheExists = loadCachedWallets();
    if (!cacheExists) {
      fetchWallets();
    }
  }, [walletsCacheKey]);

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
          <BalanceCard
            balance={walletBalance}
            changePercent={0.3}
            isLoading={loading}
          />
        </div>
        <div className="holdings-container">
          <h3>Crypto Wallets</h3>
          <WalletTable wallets={wallets} isLoading={loading} />
          <RefreshButton onRefresh={handleRefresh} isLoading={loading} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
