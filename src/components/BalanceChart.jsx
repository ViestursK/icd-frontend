import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";

const BalanceChart = ({ balance, changePercent }) => {
  const [chartPath, setChartPath] = useState("");
  const [areaPath, setAreaPath] = useState("");

  // Determine colors based on change percent (positive/negative)
  const isPositive = parseFloat(changePercent) >= 0;
  const strokeColor = isPositive ? "#32c376" : "#ff4c4c";
  const gradientStart = isPositive
    ? "rgba(50, 195, 118, 0.2)"
    : "rgba(255, 76, 76, 0.2)";
  const gradientEnd = "rgba(28, 24, 51, 0)";

  useEffect(() => {
    // Don't generate chart paths if there's no balance
    if (parseFloat(balance) <= 0) {
      setChartPath("");
      setAreaPath("");
      return;
    }
    
    // Generate points for a natural-looking chart
    const generatePoints = () => {
      const numPoints = 12; // More points for a smoother curve
      const width = 100;
      const height = 50;
      const points = [];

      // Add slight randomness based on change percent for better visualization
      const changeValue = parseFloat(changePercent) || 0;
      const direction = changeValue >= 0 ? -1 : 1; // Negative means line goes up (SVG y is inverted)
      
      for (let i = 0; i < numPoints; i++) {
        const x = (i / (numPoints - 1)) * width;
        const progress = i / (numPoints - 1);
        
        // Base y position (middle for neutral)
        let baseY = height / 2;
        
        // Create a smoother curve with less randomness for cleaner look
        const trendFactor = direction * Math.abs(changeValue) * 0.2;
        
        // Less randomness for more stable line
        const randomness = Math.sin(i * 1.5) * 3;
        
        // Calculate final y position
        const y = baseY + progress * trendFactor * height + randomness;
        
        // Ensure y stays within bounds
        const clampedY = Math.min(Math.max(y, 5), height - 5);
        
        points.push({ x, y: clampedY });
      }
      
      return points;
    };

    const points = generatePoints();

    // Create SVG path for line - smoother with curve interpolation
    let linePath = "";
    let areaPathData = "";

    points.forEach((point, i) => {
      if (i === 0) {
        // Starting point
        linePath = `M${point.x},${point.y}`;
        areaPathData = `M${point.x},50 L${point.x},${point.y}`;
      } else if (i === points.length - 1) {
        // End point - straight line to last point
        linePath += ` L${point.x},${point.y}`;
        areaPathData += ` L${point.x},${point.y}`;
      } else {
        // Use curve for smoother lines - use cubic bezier for smoother look
        const prevPoint = points[i - 1];
        const nextPoint = points[i + 1];
        
        // Control points for subtle curve
        const cp1x = prevPoint.x + (point.x - prevPoint.x) * 0.5;
        const cp1y = prevPoint.y;
        const cp2x = point.x - (point.x - prevPoint.x) * 0.5;
        const cp2y = point.y;
        
        linePath += ` C${cp1x},${cp1y} ${cp2x},${cp2y} ${point.x},${point.y}`;
        areaPathData += ` L${point.x},${point.y}`;
      }
    });

    // Complete the area path by returning to the bottom
    areaPathData += ` L${points[points.length - 1].x},50 Z`;

    setChartPath(linePath);
    setAreaPath(areaPathData);
  }, [balance, changePercent]);

  // Don't render anything if there's no chart data
  if (!chartPath || !areaPath) {
    return null;
  }

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

      {/* Grid lines for better visibility - more subtle */}
      <line
        x1="0"
        y1="25"
        x2="100"
        y2="25"
        stroke="rgba(255,255,255,0.03)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="38"
        x2="100"
        y2="38"
        stroke="rgba(255,255,255,0.02)"
        strokeWidth="0.5"
      />
      <line
        x1="0"
        y1="12"
        x2="100"
        y2="12"
        stroke="rgba(255,255,255,0.02)"
        strokeWidth="0.5"
      />

      {/* Area fill under the curve */}
      <path d={areaPath} fill="url(#chartGradient)" stroke="none" />

      {/* The line chart itself - with rounded line joins for smoother look */}
      <path
        d={chartPath}
        fill="none"
        stroke={strokeColor}
        strokeWidth="1.2"
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