import React, { useEffect } from "react";
import { Link } from "react-router-dom";
import {
  FaChartLine,
  FaWallet,
  FaLock,
  FaShieldAlt,
  FaCheck,
} from "react-icons/fa";
import DashboardShowcase from "../components/ui/DashboardShowcase";
import ThemeLogo from "../components/ui/ThemeLogo";
import "./LandingPage.css";
import { FaImagePortrait } from "react-icons/fa6";

const LandingPage = () => {
  // Listen for scroll to change navbar appearance
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="landing-page">
      {/* Hero Section with Dashboard Showcase */}
      <section className="hero-section">
        <div className="hero-container">
          <div className="hero-content">
            <h1 className="hero-title">ALL YOUR CRYPTO, ONE DASHBOARD</h1>
            <p className="hero-subtitle">
              Pulling all your wallets, exchanges, and assets across 20+
              blockchains into one single dashboard.
            </p>
            <div className="hero-buttons">
              <Link to="/register" className="primary-button">
                Get Started
              </Link>
              <button
                onClick={() => {
                  const section = document.getElementById("features");
                  if (section) {
                    section.scrollIntoView({ behavior: "smooth" });
                  }
                }}
                className="secondary-button"
              >
                Learn More
              </button>
            </div>
          </div>

          <div className="hero-showcase">
            <DashboardShowcase />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="features-section">
        <div className="landing-container">
          <h2 className="section-title">OUR FOCUS IS ON WHAT MATTERS</h2>
          <p className="section-subtitle">
            {/* Everything you need to manage your crypto investments */}
          </p>

          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">
                <FaWallet />
              </div>
              <h3>Multi-Chain Support</h3>
              <p>
                Track assets across 21 (and growing) blockchains (Ethereum,
                Solana, BNB Smart Chain and others)
              </p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaChartLine />
              </div>
              <h3>Real-Time Tracking [in progress]</h3>
              <p>Real-time price updates for all popular tokens.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaImagePortrait />
              </div>
              <h3>NFT tracking [in progress]</h3>
              <p>Got more than coins? We got you covered.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon">
                <FaLock />
              </div>
              <h3>Zero-risk</h3>
              <p>No wallet connection needed, just drop the address</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="how-it-works-section">
        <div className="landing-container">
          <h2 className="section-title">How It Works</h2>
          {/* <p className="section-subtitle">Get started in three simple steps</p> */}

          <div className="steps-container">
            <div className="step-card">
              <div className="step-number">1</div>
              <h3>Create an Account</h3>
              <p>Sign up with email</p>
            </div>

            <div className="step-card">
              <div className="step-number">2</div>
              <h3>Add Your Wallet</h3>
              <p>Paste the wallet address you want to add to your portfolio</p>
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
          <p className="section-subtitle"></p>{" "}
          {/*Your security is our top priority*/}
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
              <h3>Is Decen free to use?</h3>
              <p>
                Yes, You can use DECEN for free for up to 2 wallets or exchange
                accounts or upgrade to premium if you want to track more.
              </p>
            </div>

            <div className="faq-item">
              <h3>Which blockchains are supported?</h3>
              <p>
                Ethereum, Solana, BNB Smart Chain, Arbitrum One, Optimism,
                Polygon, Avalanche, Base, Scroll, zkSync, Zora, Berachain,
                Blast, Celo, Ronin, Rootstock, Gnosis (formerly xDai), Linea,
                Unichain, World Chain, Abstract, AnimeChain, ApeChain, Genesys,
                Ink, Lens Protocol, Soneium, Story Protocol.
              </p>
            </div>

            <div className="faq-item">
              <h3>Do I need to connect my wallet?</h3>
              <p>No, you only need to provide the wallet addresses.</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="landing-container">
          <h2>All your crypto in the palm of your hand.</h2>
          {/* <p>
            Join thousands of users who trust Decent for their crypto tracking
            needs
          </p> */}
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
              <ThemeLogo className="logo-img" size="medium" />
            </div>
            <p className="footer-text">© 2025 Decent. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
