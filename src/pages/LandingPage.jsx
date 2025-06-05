import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaWallet,
  FaChartPie,
  FaMoon,
  FaSun,
  FaLock,
  FaShieldAlt,
  FaCheck,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { useTheme } from "../context/ThemeContext";
import DashboardShowcase from "../components/ui/DashboardShowcase";
import "./LandingPage.css";

const LandingPage = () => {
  const { theme, toggleTheme } = useTheme();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Listen for scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Scroll to section
  const scrollToSection = (sectionId) => {
    const section = document.getElementById(sectionId);
    if (section) {
      section.scrollIntoView({ behavior: "smooth" });
    }
    setMobileMenuOpen(false);
  };

  return (
    <div className="landing-page">
      {/* Navigation */}
      <nav
        className={`landing-nav ${isScrolled ? "scrolled" : ""} ${
          mobileMenuOpen ? "menu-open" : ""
        }`}
      >
        <div className="landing-container nav-container">
          <div className="nav-logo">
            <img
              src="/assets/DECEN_logo_nobckgrnd.webp"
              alt="Decent"
              className="logo-img"
            />
          </div>

          <div
            className="nav-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <FaTimes /> : <FaBars />}
          </div>

          <div className={`nav-links ${mobileMenuOpen ? "open" : ""}`}>
            <button onClick={() => scrollToSection("features")}>
              Features
            </button>
            <button onClick={() => scrollToSection("how-it-works")}>
              How It Works
            </button>
            <button onClick={() => scrollToSection("security")}>
              Security
            </button>
            <button onClick={() => scrollToSection("faq")}>FAQ</button>

            <div
              className="theme-toggle"
              onClick={toggleTheme}
              title={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            >
              {theme === "dark" ? <FaSun /> : <FaMoon />}
            </div>

            <div className="auth-buttons">
              <Link to="/login" className="nav-login">
                Login
              </Link>
              <Link to="/register" className="nav-signup">
                Sign Up Free
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section with Dashboard Showcase */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">
              Track Your Crypto Portfolio In Real-Time
            </h1>
            <p className="hero-subtitle">
              Monitor all your cryptocurrency investments in one place with
              powerful analytics, real-time updates, and multi-chain support.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Get Started — It's Free
              </Link>
              <button
                onClick={() => scrollToSection("features")}
                className="secondary-button"
              >
                Learn More
              </button>
            </div>
          </div>

          {/* Replace the old hero-image with the new DashboardShowcase */}
          <div className="hero-showcase">
            <DashboardShowcase />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="landing-container">
          <h2 className="section-title">Powerful Portfolio Tracking</h2>
          <p className="section-subtitle">
            Everything you need to manage your crypto investments
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Real-Time Tracking</h3>
              <p>
                Monitor your portfolio value with live price updates and
                performance metrics
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaWallet />
              </div>
              <h3>Multi-Chain Support</h3>
              <p>
                Track assets across Ethereum, Bitcoin, Binance Smart Chain,
                Polygon, and more
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaChartPie />
              </div>
              <h3>Portfolio Analytics</h3>
              <p>
                Visualize your asset allocation and analyze performance with
                intuitive charts
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaLock />
              </div>
              <h3>Non-Custodial</h3>
              <p>
                We never hold your keys - just connect your wallet addresses for
                tracking
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="landing-container">
          <h2 className="section-title">How It Works</h2>
          <p className="section-subtitle">Get started in three simple steps</p>

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create an Account</h3>
              <p>Sign up with your email and create a secure password</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Add Your Wallets</h3>
              <p>Connect your wallet addresses from any supported blockchain</p>
            </div>

            <div className="step-card">
              <div className="step-number">3</div>
              <h3>Track Your Portfolio</h3>
              <p>
                View your complete portfolio with real-time data and insights
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="security-section">
        <div className="landing-container">
          <h2 className="section-title">Security First</h2>
          <p className="section-subtitle">Your security is our top priority</p>

          <div className="security-features">
            <div className="security-feature">
              <div className="security-icon">
                <FaShieldAlt />
              </div>
              <div className="security-content">
                <h3>View-Only Access</h3>
                <p>
                  We only need your public wallet addresses - your private keys
                  are never exposed or required
                </p>
              </div>
            </div>

            <div className="security-feature">
              <div className="security-icon">
                <FaLock />
              </div>
              <div className="security-content">
                <h3>Encrypted Data</h3>
                <p>
                  All your data is encrypted in transit and at rest using
                  industry-standard encryption
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="faq-section">

        <div className="landing-container">
          <h2 className="section-title">Frequently Asked Questions</h2>

          <div className="faq-container">
            <div className="faq-item">
              <h3>Is Decent free to use?</h3>
              <p>
                Yes, Decent is completely free for basic portfolio tracking. We
                offer premium features for advanced users.
              </p>
            </div>

            <div className="faq-item">
              <h3>Which blockchains are supported?</h3>
              <p>
                We currently support Ethereum, Bitcoin, Binance Smart Chain,
                Polygon, Avalanche, Solana, and more blockchains.
              </p>
            </div>

            <div className="faq-item">
              <h3>Do I need to connect my wallet?</h3>
              <p>
                No, you only need to provide your public wallet addresses. We
                never ask for or store private keys or seed phrases.
              </p>
            </div>

            <div className="faq-item">
              <h3>How often is the data updated?</h3>
              <p>
                Portfolio data is updated in real-time, with price information
                refreshed every few minutes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="landing-container">
          <h2>Ready to take control of your crypto portfolio?</h2>
          <p>
            Join thousands of users who trust Decent for their crypto tracking
            needs
          </p>
          <div className="cta-features">
            <div className="cta-feature">
              <FaCheck /> Free to use
            </div>
            <div className="cta-feature">
              <FaCheck /> No credit card required
            </div>
            <div className="cta-feature">
              <FaCheck /> Quick setup
            </div>
          </div>
          <Link to="/register" className="cta-button">
            Create Your Free Account
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container">
          <div className="footer-content">
            <div className="footer-logo">
              <img
                src="/assets/DECEN_logo_nobckgrnd.webp"
                alt="Decent"
                className="logo-img"
              />
            </div>
            <p className="footer-text">© 2025 Decent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
