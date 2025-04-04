import React, { useState } from "react";
import { FaWallet, FaCoins, FaExchangeAlt } from "react-icons/fa";
import Header from "../components/ui/Header";
import BalanceCard from "../components/BalanceCard";
import WalletForm from "../components/WalletForm";
import WalletTable from "../components/WalletTable";
import AssetTable from "../components/AssetTable";
import ExchangeTable from "../components/ExchangeTable";
import RefreshButton from "../components/ui/RefreshButton";
import TabSelector from "../components/TabSelector";
import { useWallet } from "../context/WalletContext";
import "./Dashboard.css";

// Define tab options
const TABS = [
  { id: "assets", label: "Assets", icon: <FaCoins /> },
  { id: "wallets", label: "Wallets", icon: <FaWallet /> },
  { id: "exchanges", label: "Exchanges", icon: <FaExchangeAlt /> },
];

function Dashboard() {
  const { wallets, totalBalance, isLoading, error, fetchWallets, clearError } =
    useWallet();
    
  // State for active tab
  const [activeTab, setActiveTab] = useState("wallets");

  // Mock data for assets table
  const [assets] = useState([
    { name: "Bitcoin", symbol: "BTC", price: 42000.50, amount: 0.5, value_usd: 21000.25 },
    { name: "Ethereum", symbol: "ETH", price: 2800.75, amount: 3.2, value_usd: 8962.40 },
    { name: "Solana", symbol: "SOL", price: 120.25, amount: 15, value_usd: 1803.75 }
  ]);

  // Mock data for exchanges table
  const [exchanges] = useState([
    { name: "Binance", account_name: "Main Account", balance_usd: 15750.45 },
    { name: "Coinbase", account_name: "Trading Account", balance_usd: 8250.32 }
  ]);

  // Handle refresh button click
  const handleRefresh = () => {
    fetchWallets(true); // Force refresh from API
  };

  // Function to render the active table based on tab
  const renderActiveTable = () => {
    switch (activeTab) {
      case "assets":
        return <AssetTable assets={assets} isLoading={isLoading} />;
      case "exchanges":
        return <ExchangeTable exchanges={exchanges} isLoading={isLoading} />;
      case "wallets":
      default:
        return <WalletTable wallets={wallets} isLoading={isLoading} />;
    }
  };

  // Get the title based on active tab
  const getTableTitle = () => {
    switch (activeTab) {
      case "assets":
        return "Crypto Assets";
      case "exchanges":
        return "Exchange Accounts";
      case "wallets":
      default:
        return "Crypto Wallets";
    }
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
            <h3>{getTableTitle()}</h3>
            <RefreshButton
              onRefresh={handleRefresh}
              isLoading={isLoading}
              aria-label="Refresh portfolio data"
            />
          </div>

          <TabSelector 
            tabs={TABS} 
            activeTab={activeTab} 
            onTabChange={setActiveTab}
          />

          {renderActiveTable()}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;