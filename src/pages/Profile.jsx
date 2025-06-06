import { useState, useEffect } from "react";
import { FaUser, FaCoins, FaChartLine } from "react-icons/fa";
import Header from "../components/ui/Header";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import { useWallet } from "../context/WalletContext";
import { getUserIdFromToken } from "../utils/auth";
import api from "../api/api";
import "./Profile.css";

// Cache settings
const PROFILE_CACHE_EXPIRATION = 30 * 60 * 1000; // 30 minutes

// Cache service
const profileCacheService = {
  set: (key, data, expiration = PROFILE_CACHE_EXPIRATION) => {
    if (!key) return false;
    localStorage.setItem(
      key,
      JSON.stringify({
        timestamp: Date.now(),
        data,
      })
    );
    return true;
  },

  get: (key, defaultExpiration = PROFILE_CACHE_EXPIRATION) => {
    if (!key) return null;
    const cachedData = localStorage.getItem(key);
    if (!cachedData) return null;

    try {
      const parsed = JSON.parse(cachedData);
      if (Date.now() - parsed.timestamp < defaultExpiration) {
        return parsed.data;
      }
      // Cache expired, remove it
      localStorage.removeItem(key);
    } catch (error) {
      console.error("Error parsing cached profile data:", error);
      localStorage.removeItem(key);
    }
    return null;
  },

  remove: (key) => {
    if (!key) return;
    localStorage.removeItem(key);
  },

  clearUserProfile: () => {
    const accessToken = localStorage.getItem("access_token");
    const userId = getUserIdFromToken(accessToken);
    if (userId) {
      localStorage.removeItem(`profile_${userId}`);
    }
  },
};

// Helper function to get profile cache key for current user
const getProfileCacheKey = () => {
  const accessToken = localStorage.getItem("access_token");
  const userId = getUserIdFromToken(accessToken);
  return userId ? `profile_${userId}` : null;
};

const Profile = () => {
  const { logout } = useAuth();
  const toast = useToast();
  const { wallets, assets, totalBalance, changePercent } = useWallet();

  // Profile state
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  // Fetch profile data from cache or /me endpoint
  const fetchProfile = async (forceRefresh = false) => {
    try {
      setLoading(true);
      setError(null);

      const profileCacheKey = getProfileCacheKey();

      // Try to get from cache first if not forcing refresh
      if (!forceRefresh && profileCacheKey) {
        const cachedProfile = profileCacheService.get(profileCacheKey);
        if (cachedProfile) {
          console.log("[DEBUG] Loading profile from cache");
          setProfile(cachedProfile);
          setFormData({
            username: cachedProfile.username || "",
            email: cachedProfile.email || "",
          });
          setLoading(false);
          return;
        }
      }

      console.log("[DEBUG] Fetching profile from API");
      const response = await api.get("/api/users/me/");
      const userData = response.data;

      setProfile(userData);
      setFormData({
        username: userData.username || "",
        email: userData.email || "",
      });

      // Cache the profile data
      if (profileCacheKey) {
        profileCacheService.set(profileCacheKey, userData);
        console.log("[DEBUG] Profile data cached");
      }
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to load profile data";
      setError(errorMessage);
      console.error("Error fetching profile:", err);
    } finally {
      setLoading(false);
    }
  };

  // Load profile on component mount
  useEffect(() => {
    fetchProfile();

    // Cleanup function
    return () => {
      // Any cleanup if needed
    };
  }, []);

  // Handle input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Save profile changes
  const handleSaveProfile = async () => {
    if (!formData.username.trim()) {
      toast.error("Username cannot be empty");
      return;
    }

    setUpdating(true);
    try {
      const response = await api.patch("/api/users/me/", {
        username: formData.username.trim(),
        email: formData.email.trim(),
      });

      const updatedProfile = response.data;
      setProfile(updatedProfile);

      // Update cache with new profile data
      const profileCacheKey = getProfileCacheKey();
      if (profileCacheKey) {
        profileCacheService.set(profileCacheKey, updatedProfile);
        console.log("[DEBUG] Profile cache updated after save");
      }

      toast.success("Profile updated successfully!");
    } catch (err) {
      const errorMessage =
        err.response?.data?.detail || "Failed to update profile";
      toast.error(errorMessage);
      console.error("Error updating profile:", err);
    } finally {
      setUpdating(false);
    }
  };

  // Force refresh profile data
  const handleRefreshProfile = async () => {
    setRefreshing(true);
    try {
      await fetchProfile(true);
      toast.success("Profile data refreshed");
    } catch (error) {
      toast.error("Failed to refresh profile data");
    } finally {
      setRefreshing(false);
    }
  };

  // Calculate portfolio statistics
  const portfolioStats = {
    walletCount: wallets.length,
    assetCount: assets.length,
    totalValue: parseFloat(totalBalance || 0),
    portfolioGrowth: parseFloat(changePercent || 0),
  };

  // Loading state
  if (loading && !profile) {
    return (
      <div className="dashboard-container">
        <Header title="PROFILE" />
        <div className="profile-container">
          <div className="shimmer-loading" style={{ height: "400px" }}></div>
        </div>
      </div>
    );
  }

  // Error state
  if (error && !profile) {
    return (
      <div className="dashboard-container">
        <Header title="PROFILE" />
        <div className="profile-container">
          <div className="error-state">
            <p>Failed to load profile data</p>
            <button onClick={() => fetchProfile(true)} className="retry-button">
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <Header title="PROFILE" />

      <div className="profile-container">
        {/* Profile Information Section */}
        <section
          className={`profile-section ${refreshing ? "refreshing" : ""}`}
        >
          <div className="profile-section-header">
            <FaUser className="section-icon" />
            <h2>Profile Information</h2>
            {refreshing && <div className="refresh-indicator">Updating...</div>}
          </div>

          <div className="profile-content">
            <div className="profile-avatar">
              <div className="avatar-circle">
                <FaUser size={40} />
              </div>
            </div>

            <div className="profile-display">
              <div className="profile-info">
                <h3 className="profile-email">
                  {profile?.email || "No email provided"}
                </h3>
                {profile?.date_joined && (
                  <p className="profile-joined">
                    Member since{" "}
                    {new Date(profile.date_joined).toLocaleDateString()}
                  </p>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Portfolio Statistics Section */}
        <section className="profile-section">
          <div className="profile-section-header">
            <FaChartLine className="section-icon" />
            <h2>Portfolio Statistics</h2>
          </div>

          <div className="stats-grid">
            <div className="stat-card">
              <div className="stat-icon wallet">
                <FaCoins />
              </div>
              <div className="stat-content">
                <h4>Total Wallets</h4>
                <p className="stat-value">{portfolioStats.walletCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon assets">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h4>Tracked Assets</h4>
                <p className="stat-value">{portfolioStats.assetCount}</p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon portfolio">
                <FaCoins />
              </div>
              <div className="stat-content">
                <h4>Portfolio Value</h4>
                <p className="stat-value">
                  ${portfolioStats.totalValue.toLocaleString()}
                </p>
              </div>
            </div>

            <div className="stat-card">
              <div className="stat-icon growth">
                <FaChartLine />
              </div>
              <div className="stat-content">
                <h4>24h Change</h4>
                <p
                  className={`stat-value ${
                    portfolioStats.portfolioGrowth >= 0
                      ? "positive"
                      : "negative"
                  }`}
                >
                  {portfolioStats.portfolioGrowth >= 0 ? "+" : ""}
                  {portfolioStats.portfolioGrowth}%
                </p>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Profile;
