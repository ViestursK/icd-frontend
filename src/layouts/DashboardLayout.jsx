import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";
import "./DashboardLayout.css";

// Premium Background Component
const PremiumBackground = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  
  // Effect to add mousemove listener for parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 15;
      const y = (e.clientY / window.innerHeight) * 15;
      setPosition({ x, y });
    };

    window.addEventListener('mousemove', handleMouseMove);
    
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    };
  }, []);

  return (
    <div className="premium-background">
      {/* Gradient orbs that move with animation */}
      <div 
        className="orb orb-purple"
        style={{ 
          top: `calc(30% - ${position.y}px)`, 
          left: `calc(30% - ${position.x}px)`
        }}
      />
      
      <div 
        className="orb orb-blue"
        style={{ 
          top: `calc(60% + ${position.y}px)`, 
          left: `calc(60% + ${position.x}px)`
        }}
      />
      
      <div 
        className="orb orb-indigo"
        style={{ 
          top: `calc(40% - ${position.y * 0.5}px)`, 
          left: `calc(70% - ${position.x * 0.5}px)`
        }}
      />
      
      <div 
        className="orb orb-rose"
        style={{ 
          top: `calc(70% + ${position.y * 0.3}px)`, 
          left: `calc(20% + ${position.x * 0.3}px)`
        }}
      />
      
      {/* Subtle noise texture overlay */}
      <div className="noise-overlay" />
      
      {/* Grid pattern for depth */}
      <div className="grid-pattern" />
      
      {/* Dark overlay to increase contrast with content */}
      <div className="dark-overlay" />
    </div>
  );
};

function DashboardLayout() {
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();

  // Redirect to login if not authenticated
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate("/login");
    }
  }, [isAuthenticated, loading, navigate]);

  // Show nothing while checking authentication
  if (loading) {
    return null;
  }

  return (
    <div className="dashboard-layout">
      {/* Add the premium background here */}
      <PremiumBackground />
      
      <Sidebar />

      <main className="dashboard-content">
        <Outlet />
      </main>
    </div>
  );
}

export default DashboardLayout;
