import React, { useState, useEffect } from "react";
import { 
  FaUser, 
  FaEnvelope, 
  FaCalendar, 
  FaCoins, 
  FaChartLine, 
  FaAward 
} from "react-icons/fa";
import Header from "../components/ui/Header";
import { useAuth } from "../context/AuthContext";
import { useToast } from "../context/ToastContext";
import "./Dashboard.css"; // Use Dashboard styles
import "./Auth.css"; // Reuse some auth page styling

const Profile = () => {
  const { logout } = useAuth();
  const toast = useToast();
  const [profile, setProfile] = useState({
    username: "CryptoTracker123",
    email: "user@example.com",
    joinDate: new Date("2024-01-15"),
    totalNetworth: 15234.56,
    portfolioGrowth: 24.5,
    achievements: [
      { id: 1, name: "First Wallet", description: "Added your first crypto wallet", date: new Date("2024-01-20") },
      { id: 2, name: "Diversified", description: "Tracked wallets across 3+ blockchains", date: new Date("2024-02-05") }
    ]
  });

  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    username: profile.username,
    email: profile.email
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSaveProfile = () => {
    setProfile(prev => ({
      ...prev,
      username: formData.username,
      email: formData.email
    }));
    setEditMode(false);
    toast.success("Profile updated successfully!");
  };

  return (
    <div className="dashboard-container">
      <Header title="PROFILE" />
      
      <div className="container">
        <div className="holdings-container">
          {/* Profile Overview */}
          <div className="holdings-header">
            <h3>Profile Information</h3>
          </div>
          
          <div className="profile-avatar text-center mb-4">
            <FaUser size={80} color="var(--color-primary)" />
          </div>

          {editMode ? (
            <div className="edit-profile-form">
              <div className="form-group">
                <label className="form-label">Username</label>
                <input
                  name="username"
                  value={formData.username}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label className="form-label">Email</label>
                <input
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="form-input"
                />
              </div>
              <div className="flex justify-between mt-4">
                <button 
                  className="auth-button" 
                  style={{ background: 'var(--color-primary)' }}
                  onClick={handleSaveProfile}
                >
                  Save Changes
                </button>
                <button 
                  className="auth-button" 
                  style={{ background: 'var(--color-text-secondary)' }}
                  onClick={() => setEditMode(false)}
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            <div className="text-center">
              <h2 className="mb-2">{profile.username}</h2>
              <p className="mb-4">{profile.email}</p>
              <button 
                className="auth-button" 
                style={{ background: 'var(--color-primary)' }}
                onClick={() => setEditMode(true)}
              >
                Edit Profile
              </button>
            </div>
          )}

          {/* Profile Stats */}
          <div className="holdings-header mt-4">
            <h3>Profile Statistics</h3>
          </div>
          <div className="grid grid-cols-3 gap-4 mb-4">
            <div className="stat-card">
              <FaCalendar className="stat-icon" />
              <div>
                <h4>Member Since</h4>
                <p>{profile.joinDate.toLocaleDateString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <FaCoins className="stat-icon" />
              <div>
                <h4>Total Networth</h4>
                <p>${profile.totalNetworth.toLocaleString()}</p>
              </div>
            </div>
            <div className="stat-card">
              <FaChartLine className="stat-icon" />
              <div>
                <h4>Portfolio Growth</h4>
                <p style={{ color: profile.portfolioGrowth > 0 ? 'var(--color-success)' : 'var(--color-error)' }}>
                  {profile.portfolioGrowth > 0 ? '+' : ''}{profile.portfolioGrowth}%
                </p>
              </div>
            </div>
          </div>

          {/* Achievements */}
          <div className="holdings-header">
            <h3>Achievements</h3>
          </div>
          <div className="grid grid-cols-2 gap-4">
            {profile.achievements.map(achievement => (
              <div key={achievement.id} className="achievement-card">
                <div className="achievement-icon">
                  <FaAward />
                </div>
                <div className="achievement-details">
                  <h4>{achievement.name}</h4>
                  <p>{achievement.description}</p>
                  <small>{achievement.date.toLocaleDateString()}</small>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <style jsx>{`
        .profile-avatar {
          display: flex;
          justify-content: center;
          margin-bottom: 1rem;
        }

        .form-input {
          background-color: #1c1833;
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #f2f2fa;
        }

        .form-input:focus {
          border-color: var(--color-primary);
          box-shadow: 0 0 0 2px rgba(125, 103, 255, 0.2);
        }

        .stat-card {
          display: flex;
          align-items: center;
          background-color: var(--color-card-background);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 0.5rem;
          padding: 1rem;
          gap: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          transition: all 0.3s ease;
        }

        .stat-card:hover {
          background-color: rgba(125, 103, 255, 0.05);
          border-color: rgba(125, 103, 255, 0.1);
        }

        .stat-icon {
          font-size: 2rem;
          color: var(--color-primary);
          min-width: 2rem;
        }

        .stat-card div {
          display: flex;
          flex-direction: column;
          overflow: hidden;
        }

        .stat-card h4 {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .stat-card p {
          margin: 0;
          font-size: 1rem;
          font-weight: 600;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .achievement-card {
          display: flex;
          align-items: center;
          background-color: var(--color-card-background);
          border-radius: 0.5rem;
          padding: 1rem;
          gap: 1rem;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }

        .achievement-icon {
          background-color: rgba(125, 103, 255, 0.1);
          color: var(--color-primary);
          border-radius: 50%;
          width: 50px;
          height: 50px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
        }

        .achievement-details h4 {
          margin: 0 0 0.5rem 0;
          font-size: 1rem;
        }

        .achievement-details p {
          margin: 0;
          font-size: 0.875rem;
          color: var(--color-text-secondary);
        }

        .achievement-details small {
          color: var(--color-text-secondary);
          font-size: 0.75rem;
        }

        .text-center {
          text-align: center;
        }

        .mb-2 {
          margin-bottom: 0.5rem;
        }

        .mb-4 {
          margin-bottom: 1rem;
        }

        .mt-4 {
          margin-top: 1.5rem;
        }

        .grid {
          display: grid;
        }

        .grid-cols-3 {
          grid-template-columns: repeat(3, 1fr);
        }

        .grid-cols-2 {
          grid-template-columns: repeat(2, 1fr);
        }

        .gap-4 {
          gap: 1rem;
        }

        .flex {
          display: flex;
        }

        .justify-between {
          justify-content: space-between;
        }

        @media (max-width: 768px) {
          .grid-cols-3,
          .grid-cols-2 {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
};

export default Profile;