import React from "react";
import Header from "../components/ui/Header";
import BalanceCard from "../components/BalanceCard";
import WalletForm from "../components/WalletForm";
import WalletTable from "../components/WalletTable";
import RefreshButton from "../components/ui/RefreshButton";
import { useWallet } from "../context/WalletContext";
import "./Dashboard.css";


function Dashboard() {
  const { wallets, totalBalance, isLoading, error, fetchWallets, clearError } =
    useWallet();

  // Handle refresh button click
  const handleRefresh = () => {
    fetchWallets(true); // Force refresh from API
  };

  return (
    <div className="dashboard-container">
      <div className="top-container">
        <Header title="DASHBOARD" />
        <WalletForm />
      </div>

      {error && (
        <div className="error-alert" role="alert">
          <p>{error}</p>
          <button
            onClick={clearError}
            aria-label="Dismiss error"
            className="dismiss-error"
          >
            ✕
          </button>
        </div>
      )}

      <h2 className="section-title">Portfolio</h2>

      <div className="container">
        <div className="stat-container">
          <BalanceCard
            balance={totalBalance}
            changePercent={0.3} // This should come from the API
            isLoading={isLoading}
          />
        </div>

        <div className="holdings-container">
          <div className="holdings-header">
            <h3>Crypto Wallets</h3>
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={isLoading}
              aria-label="Refresh wallet data"
            />
          </div>

          <WalletTable wallets={wallets} isLoading={isLoading} />
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
