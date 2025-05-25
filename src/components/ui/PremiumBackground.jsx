import React, { useEffect, useState } from "react";
import { useTheme } from "../../context/ThemeContext";
import "./PremiumBackground.css";

const PremiumBackground = () => {
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const { theme } = useTheme();

  useEffect(() => {
    const handleMouseMove = (e) => {
      const x = (e.clientX / window.innerWidth) * 15;
      const y = (e.clientY / window.innerHeight) * 15;
      setPosition({ x, y });
    };

    window.addEventListener("mousemove", handleMouseMove);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <div className="premium-background">
      <div
        className="orb orb-purple"
        style={{
          top: `calc(30% - ${position.y}px)`,
          left: `calc(30% - ${position.x}px)`,
        }}
      />
      <div
        className="orb orb-blue"
        style={{
          top: `calc(60% + ${position.y}px)`,
          left: `calc(60% + ${position.x}px)`,
        }}
      />
      <div
        className="orb orb-indigo"
        style={{
          top: `calc(40% - ${position.y * 0.5}px)`,
          left: `calc(70% - ${position.x * 0.5}px)`,
        }}
      />
      <div
        className="orb orb-rose"
        style={{
          top: `calc(70% + ${position.y * 0.3}px)`,
          left: `calc(20% + ${position.x * 0.3}px)`,
        }}
      />
      <div className="noise-overlay" />
      <div className="grid-pattern" />
      <div className="dark-overlay" />
    </div>
  );
};

export default PremiumBackground;
