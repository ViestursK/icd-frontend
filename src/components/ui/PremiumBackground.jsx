import "./PremiumBackground.css";

const PremiumBackground = () => {
  return (
    <div className="premium-background">
      <div className="orb orb-purple" />
      <div className="orb orb-blue" />
      <div className="orb orb-indigo" />
      <div className="orb orb-rose" />

      <div className="noise-overlay" />
      <div className="grid-pattern" />
      <div className="dark-overlay" />
    </div>
  );
};

export default PremiumBackground;
