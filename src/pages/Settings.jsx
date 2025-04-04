import React, { useState } from "react";
import { FaCog, FaBell, FaShieldAlt, FaPalette, FaKey, FaTrash } from "react-icons/fa";
import Header from "../components/ui/Header";
import RefreshButton from "../components/ui/RefreshButton";
import { useToast } from "../context/ToastContext";
import { useAuth } from "../context/AuthContext";
import "./Dashboard.css"; // Use Dashboard styles
import "./Auth.css"; // Reuse some auth page styling

const Settings = () => {
  const toast = useToast();
  const { logout } = useAuth();
  const [preferences, setPreferences] = useState({
    theme: "dark",
    notifications: {
      priceAlerts: true,
      portfolioChanges: true,
      securityUpdates: true
    },
    currency: "USD",
    privacyMode: false
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorAuth: false,
    loginNotifications: false
  });

  const handlePreferenceToggle = (category, setting) => {
    setPreferences(prev => ({
      ...prev,
      [category]: typeof prev[category] === 'boolean' 
        ? !prev[category]
        : {
          ...prev[category],
          [setting]: !prev[category][setting]
        }
    }));
  };

  const handleSecurityToggle = (setting) => {
    setSecuritySettings(prev => ({
      ...prev,
      [setting]: !prev[setting]
    }));
  };

  const handleDeleteAccount = () => {
    if (window.confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
      toast.error("Account deletion is not implemented in this demo.", { duration: 5000 });
    }
  };

  const handleExportData = () => {
    toast.info("Exporting portfolio data...", { duration: 3000 });
    // Simulated data export
    const portfolioData = JSON.stringify({
      wallets: [
        { address: "0x123...", chain: "ETH", balance: 2.5 },
        { address: "bc1q...", chain: "BTC", balance: 0.05 }
      ],
      totalValue: 5000,
      lastUpdated: new Date().toISOString()
    }, null, 2);

    const blob = new Blob([portfolioData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `portfolio_export_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="dashboard-container">
      <Header title="SETTINGS" />
      
      <div className="container">
        <div className="holdings-container">
          {/* Theme and Appearance */}
          <div className="holdings-header">
            <h3 className="flex items-center">
              <FaPalette style={{ marginRight: '0.5rem' }} /> 
              Appearance
            </h3>
          </div>
          <div className="form-group">
            <label className="form-label">Theme</label>
            <select 
              className="form-input"
              value={preferences.theme}
              onChange={(e) => setPreferences(prev => ({ ...prev, theme: e.target.value }))}
            >
              <option value="dark">Dark (Default)</option>
              <option value="light">Light</option>
              <option value="system">System Preference</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Default Currency</label>
            <select 
              className="form-input"
              value={preferences.currency}
              onChange={(e) => setPreferences(prev => ({ ...prev, currency: e.target.value }))}
            >
              <option value="USD">US Dollar (USD)</option>
              <option value="EUR">Euro (EUR)</option>
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
            </select>
          </div>

          {/* Notifications */}
          <div className="holdings-header mt-4">
            <h3 className="flex items-center">
              <FaBell style={{ marginRight: '0.5rem' }} /> 
              Notifications
            </h3>
          </div>
          {Object.entries(preferences.notifications).map(([key, value]) => (
            <div key={key} className="form-group flex justify-between items-center">
              <span className="form-label capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={value}
                  onChange={() => handlePreferenceToggle('notifications', key)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}

          {/* Security */}
          <div className="holdings-header mt-4">
            <h3 className="flex items-center">
              <FaShieldAlt style={{ marginRight: '0.5rem' }} /> 
              Security
            </h3>
          </div>
          {Object.entries(securitySettings).map(([key, value]) => (
            <div key={key} className="form-group flex justify-between items-center">
              <span className="form-label capitalize">
                {key.replace(/([A-Z])/g, ' $1').toLowerCase()}
              </span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={value}
                  onChange={() => handleSecurityToggle(key)}
                />
                <span className="slider"></span>
              </label>
            </div>
          ))}

          {/* Data Management */}
          <div className="holdings-header mt-4">
            <h3 className="flex items-center">
              <FaCog style={{ marginRight: '0.5rem' }} /> 
              Data Management
            </h3>
          </div>
          <div className="form-group flex justify-between items-center">
            <span className="form-label">Export Portfolio Data</span>
            <RefreshButton 
              label="Export"
              variant="secondary"
              onRefresh={handleExportData}
            />
          </div>

          {/* Danger Zone */}
          <div className="holdings-header mt-4">
            <h3 className="flex items-center text-error">
              <FaTrash style={{ marginRight: '0.5rem' }} /> 
              Danger Zone
            </h3>
          </div>
          <div className="form-group flex justify-between items-center">
            <span className="form-label">Delete Account</span>
            <button 
              className="auth-button" 
              style={{ 
                background: 'linear-gradient(135deg, #ff4c4c, #ff6b6b)', 
                width: 'auto' 
              }}
              onClick={handleDeleteAccount}
            >
              Delete Account
            </button>
          </div>
        </div>
      </div>

      <style jsx>{`
        .form-group {
          margin-bottom: 1rem;
        }

        .form-label {
          margin-bottom: 0.5rem;
        }

        .form-input {
          width: 100%;
          background-color: #1c1833;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f2f2fa;
        }

        .form-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(125, 103, 255, 0.2);
        }

        .switch {
          position: relative;
          display: inline-block;
          width: 50px;
          height: 24px;
        }

        .switch input {
          opacity: 0;
          width: 0;
          height: 0;
        }

        .slider {
          position: absolute;
          cursor: pointer;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background-color: rgba(255, 255, 255, 0.1);
          transition: .4s;
          border-radius: 34px;
        }

        .slider:before {
          position: absolute;
          content: "";
          height: 16px;
          width: 16px;
          left: 4px;
          bottom: 4px;
          background-color: #9e9ea0;
          transition: .4s;
          border-radius: 50%;
        }

        input:checked + .slider {
          background-color: var(--color-primary);
        }

        input:checked + .slider:before {
          transform: translateX(26px);
          background-color: white;
        }

        .text-error {
          color: #ff4c4c;
        }

        .mt-4 {
          margin-top: 1.5rem;
        }

        /* Improve select styling */
        select.form-input {
          appearance: none;
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%239e9ea0' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 0.75rem center;
          padding-right: 2rem;
        }
      `}</style>
    </div>
  );
};

export default Settings;