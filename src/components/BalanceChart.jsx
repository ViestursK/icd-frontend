import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const BalanceChart = ({ balance, changePercent }) => {
  const [chartPath, setChartPath] = useState("");
  const [areaPath, setAreaPath] = useState("");

  // Determine colors based on change percent (positive/negative)
  const isPositive = parseFloat(changePercent) >= 0;
  const strokeColor = isPositive ? "#32c376" : "#ff4c4c";
  const gradientStart = isPositive
    ? "rgba(50, 195, 118, 0.3)"
    : "rgba(255, 76, 76, 0.3)";
  const gradientEnd = "rgba(28, 24, 51, 0)";

  useEffect(() => {
    // Generate points for a natural-looking chart
    const generatePoints = () => {
      // We'll create a simple upward or downward curve based on the change percent
      const numPoints = 10;
      const width = 100;
      const height = 50;

      // Create control points for a smooth curve
      const points = [];

      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * width;

        // Base y position (should be in the middle for neutral)
        let baseY = height / 2;

        // Adjust based on change percent
        const changeValue = parseFloat(changePercent) || 0;
        const direction = changeValue >= 0 ? -1 : 1; // Negative means the line goes up (in SVG y is inverted)

        // Create a smooth curve with a bit of randomness
        // For positive change: mostly goes down (visually up)
        // For negative change: mostly goes up (visually down)
        const progress = i / (numPoints - 1);

        // Start around the middle and end with an appropriate trend
        let trendFactor = direction * Math.abs(changeValue) * 0.25;

        // Add slight randomness for a more natural look
        const randomness = Math.sin(i * 1.5) * 5;

        // Calculate final y position
        const y = baseY + progress * trendFactor * height + randomness;

        // Ensure y stays within bounds
        const clampedY = Math.min(Math.max(y, 5), height - 5);

        points.push({ x, y: clampedY });
      }

      return points;
    };

    const points = generatePoints();

    // Create SVG path for line
    let linePath = "";
    let areaPathData = "";

    points.forEach((point, i) => {
      if (i === 0) {
        linePath = `M${point.x},${point.y}`;
        areaPathData = `M${point.x},50 L${point.x},${point.y}`;
      } else {
        linePath += ` L${point.x},${point.y}`;
        areaPathData += ` L${point.x},${point.y}`;
      }
    });

    // Complete the area path by returning to the bottom
    areaPathData += ` L${points[points.length - 1].x},50 Z`;

    setChartPath(linePath);
    setAreaPath(areaPathData);
  }, [balance, changePercent]);

  return (
    <svg
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
      style={{ width: "100%", height: "100%", display: "block" }}
    >
      <defs>
        <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientStart} stopOpacity="0.8" />
          <stop offset="100%" stopColor={gradientEnd} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Grid lines for better visibility */}
      <line
        x1="0"
        y1="25"
        x2="100"
        y2="25"
        stroke="rgba(255,255,255,0.05)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="50"
        x2="100"
        y2="50"
        stroke="rgba(255,255,255,0.1)"
        strokeWidth="0.5"
      />

      {/* Area fill under the curve */}
      <path d={areaPath} fill="url(#chartGradient)" stroke="none" />

      {/* The line chart itself */}
      <path
        d={chartPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
};

BalanceChart.propTypes = {
  balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
  changePercent: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
};

BalanceChart.defaultProps = {
  balance: "0.00",
  changePercent: "0.00",
};

export default BalanceChart;
