import React, { useState, useEffect } from "react";
import {
  FaUser,
  FaChartLine,
  FaEnvelope,
  FaCalendar,
  FaCoins,
  FaWallet,
} from "react-icons/fa";
import Header from "../components/ui/Header";
import { useWallet } from "../context/WalletContext";
import { useToast } from "../context/ToastContext";
import api from "../api/api";
import "./Profile.css";

const Profile = () => {
  const { totalBalance, changePercent, wallets, assets } = useWallet();
  const toast = useToast();

  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get("/api/users/me/");
        setUserProfile(response.data);
      } catch (error) {
        console.error("Error fetching profile:", error);
        toast.error("Failed to load profile data");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [toast]);

  const portfolioStats = React.useMemo(() => {
    return {
      walletCount: wallets.length,
      assetCount: assets.length,
      totalValue: parseFloat(totalBalance || 0),
      growth24h: parseFloat(changePercent || 0),
      joinDate: userProfile?.date_joined
        ? new Date(userProfile.date_joined)
        : null,
    };
  }, [wallets, assets, totalBalance, changePercent, userProfile]);

  if (loading) {
    return (
      <div className="dashboard-container">
        <Header title="PROFILE" />
        <div className="profile-container">
          <section className="profile-section"></section>
        </div>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="dashboard-container">
        <Header title="PROFILE" />
        <div className="profile-container">
          <section className="profile-section">
            <div className="profile-header">
              <FaUser className="profile-icon" />
              <h2>Profile</h2>
            </div>
            <div className="profile-error">
              <p>Failed to load profile data</p>
            </div>
          </section>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header title="PROFILE" />

      <div className="profile-container">
        {/* Profile Information */}
        <section className="profile-section">
          <div className="profile-header">
            <FaUser className="profile-icon" />
            <h2>Account Information</h2>
          </div>

          <div className="info">
            <div className="info-row">
              <FaUser className="info-icon" />
              <div className="info-content">
                <span className="info-label">User ID</span>
                <span className="info-value">#{userProfile.id}</span>
              </div>
            </div>

            <div className="info-row">
              <FaEnvelope className="info-icon" />
              <span className="info-label">Email</span>
              <span className="info-value">{userProfile.email}</span>
            </div>

            {portfolioStats.joinDate && (
              <div className="info-row">
                <FaCalendar className="info-icon" />
                <div className="info-content">
                  <span className="info-label">Member Since</span>
                  <span className="info-value">
                    {portfolioStats.joinDate.toLocaleDateString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Portfolio Overview */}
        <section className="profile-section">
          <div className="profile-header">
            <FaChartLine className="profile-icon" />
            <h2>Portfolio Overview</h2>
          </div>

          <div className="info">
            <div className="stat-card">
              <FaCoins className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Total Value</span>
                <span className="stat-value">
                  ${portfolioStats.totalValue.toLocaleString()}
                </span>
              </div>
            </div>

            <div className="stat-card">
              <FaChartLine className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">24h Change</span>
                <span
                  className={`stat-value ${
                    portfolioStats.growth24h >= 0 ? "positive" : "negative"
                  }`}
                >
                  {portfolioStats.growth24h >= 0 ? "+" : ""}
                  {portfolioStats.growth24h.toFixed(2)}%
                </span>
              </div>
            </div>

            <div className="stat-card">
              <FaWallet className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Wallets</span>
                <span className="stat-value">{portfolioStats.walletCount}</span>
              </div>
            </div>

            <div className="stat-card">
              <FaCoins className="stat-icon" />
              <div className="stat-content">
                <span className="stat-label">Assets</span>
                <span className="stat-value">{portfolioStats.assetCount}</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
