// BalanceChart.jsx
import React, { useMemo } from "react";
import PropTypes from "prop-types";

const BalanceChart = ({
  balance,
  changePercent,
  className = "",
  style = {},
}) => {
  // Parse values and determine chart appearance
  const isPositive = parseFloat(changePercent) >= 0;
  const strokeColor = isPositive ? "#32c376" : "#ff4c4c";
  const gradientStart = isPositive
    ? "rgba(50, 195, 118, 0.2)"
    : "rgba(255, 76, 76, 0.2)";
  const gradientEnd = "rgba(28, 24, 51, 0)";

  // Generate unique ID for gradient to prevent conflicts when multiple charts are on the page
  const gradientId = useMemo(
    () => `chart-gradient-${Math.random().toString(36).substring(2, 9)}`,
    []
  );

  // Generate chart path based on change percentage
  const paths = useMemo(() => {
    const changeValue = parseFloat(changePercent) || 0;
    const direction = changeValue >= 0 ? 1 : -1;

    // Scale the trend factor based on the change percentage
    // but keep it in a reasonable range for visual appeal
    const trendFactor = Math.min(Math.abs(changeValue) * 0.3, 10);

    let startY = 30;
    let linePath = `M0,${startY}`;
    let areaPath = `M0,50 L0,${startY}`;

    // Create smooth curve with 10 points
    for (let i = 1; i < 10; i++) {
      const x = i * 10;
      const progress = i / 10;

      // Add a subtle randomness for natural looking chart
      const randomness = Math.sin(i * 0.5) * 3;

      // Calculate Y position based on trend direction and magnitude
      const y = startY - progress * direction * trendFactor - randomness;

      // Clamp Y values to keep within visible range
      const clampedY = Math.min(Math.max(y, 5), 45);

      // Add curve control points for smooth animation
      linePath += ` C${x - 5},${startY} ${x - 5},${clampedY} ${x},${clampedY}`;
      areaPath += ` L${x},${clampedY}`;
      startY = clampedY;
    }

    // Complete the path
    linePath += ` L100,${startY - direction * trendFactor * 0.5}`;
    areaPath += ` L100,${startY - direction * trendFactor * 0.5} L100,50 Z`;

    return { linePath, areaPath };
  }, [changePercent]);

  return (
    <svg
      viewBox="0 0 100 50"
      preserveAspectRatio="none"
      className={className}
      style={{
        width: "100%",
        height: "100%",
        display: "block",
        ...style,
      }}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={gradientStart} stopOpacity="0.8" />
          <stop offset="100%" stopColor={gradientEnd} stopOpacity="0.1" />
        </linearGradient>
      </defs>

      {/* Grid lines for visual reference */}
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

      {/* Area fill beneath the line */}
      <path d={paths.areaPath} fill={`url(#${gradientId})`} stroke="none" />

      {/* Line representing the trend */}
      <path
        d={paths.linePath}
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
  className: PropTypes.string,
  style: PropTypes.object,
};

export default BalanceChart;
