import { useEffect, useState } from "react";
import "./PremiumBackground.css";

const PremiumBackground = () => {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  const [isInitialized, setIsInitialized] = useState(false);

  // Track mouse position for subtle parallax effect
  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 20;
      const y = (e.clientY / window.innerHeight - 0.5) * 20;
      setMousePosition({ x, y });

      if (!isInitialized) {
        setIsInitialized(true);
      }
    };

    // Initialize with center position
    setMousePosition({ x: 0, y: 0 });
    setIsInitialized(true);

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, [isInitialized]);

  return (
    <div className="premium-background">
      {/* Color orbs with parallax effect */}
      <div
        className="orb orb-purple"
        style={{
          "--mouse-x": `${mousePosition.x}px`,
          "--mouse-y": `${mousePosition.y}px`,
          opacity: isInitialized ? 0.7 : 0,
        }}
      />
      <div
        className="orb orb-blue"
        style={{
          "--mouse-x": `${mousePosition.x}px`,
          "--mouse-y": `${mousePosition.y}px`,
          opacity: isInitialized ? 0.7 : 0,
        }}
      />
      <div
        className="orb orb-indigo"
        style={{
          "--mouse-x": `${mousePosition.x}px`,
          "--mouse-y": `${mousePosition.y}px`,
          opacity: isInitialized ? 0.7 : 0,
        }}
      />
      <div
        className="orb orb-rose"
        style={{
          "--mouse-x": `${mousePosition.x}px`,
          "--mouse-y": `${mousePosition.y}px`,
          opacity: isInitialized ? 0.7 : 0,
        }}
      />

      {/* Background effects */}
      <div className="noise-overlay" />
      <div className="grid-pattern" />
      <div className="dark-overlay" />
    </div>
  );
};

export default PremiumBackground;
