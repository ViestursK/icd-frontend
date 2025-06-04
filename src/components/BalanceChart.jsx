import React, { useMemo, useEffect, useState } from "react";
import PropTypes from "prop-types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";

const BalanceChart = ({
  changePercent,
  balance,
  className = "",
  style = {},
}) => {
  const [themeColors, setThemeColors] = useState({
    success: "#84cc16",
    error: "#f87171",
    muted: "#71717a",
    successRgb: "132, 204, 22",
    errorRgb: "248, 113, 113",
    mutedRgb: "113, 113, 122",
    backgroundRgb: "10, 10, 10",
  });

  // Get CSS custom properties for theme-aware colors
  useEffect(() => {
    const updateThemeColors = () => {
      const root = document.documentElement;
      const computedStyle = getComputedStyle(root);

      setThemeColors({
        success:
          computedStyle.getPropertyValue("--color-success").trim() || "#84cc16",
        error:
          computedStyle.getPropertyValue("--color-error").trim() || "#f87171",
        muted:
          computedStyle.getPropertyValue("--color-text-muted").trim() ||
          "#71717a",
        successRgb:
          computedStyle.getPropertyValue("--color-success-rgb").trim() ||
          "132, 204, 22",
        errorRgb:
          computedStyle.getPropertyValue("--color-error-rgb").trim() ||
          "248, 113, 113",
        mutedRgb:
          computedStyle.getPropertyValue("--color-text-muted").trim() ||
          "113, 113, 122",
        backgroundRgb:
          computedStyle.getPropertyValue("--color-background").trim() ||
          "10, 10, 10",
      });
    };

    updateThemeColors();

    // Listen for theme changes
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateThemeColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const pct = parseFloat(changePercent) || 0;
  const bal = parseFloat(balance) || 0;
  const isPositive = pct > 0;
  const isNegative = pct < 0;
  const isFlat = pct === 0 && bal === 0;

  // Use theme-aware colors
  const strokeColor = isFlat
    ? themeColors.muted
    : isPositive
    ? themeColors.success
    : themeColors.error;

  const gradientStart = isFlat
    ? `rgba(${themeColors.mutedRgb}, 0.3)`
    : isPositive
    ? `rgba(${themeColors.successRgb}, 0.25)`
    : `rgba(${themeColors.errorRgb}, 0.25)`;

  const gradientEnd = `rgba(${themeColors.backgroundRgb}, 0)`;

  const gradientId = useMemo(
    () => `chart-gradient-${Math.random().toString(36).substr(2, 9)}`,
    []
  );

  const seed = useMemo(() => Math.random(), []);

  const data = useMemo(() => {
    if (isFlat) {
      return Array.from({ length: 11 }, (_, i) => ({
        x: i * 10,
        value: 30,
      }));
    }

    const direction = isPositive ? 1 : -1;
    const trendFactor = Math.min(Math.abs(pct) * 0.3, 10);
    let current = 30;
    const points = [];

    for (let i = 0; i <= 10; i++) {
      const wobble = (Math.random() - 0.5) * 1.5;
      current += direction * (trendFactor * 0.5 + wobble);
      const clampedY = Math.min(Math.max(current, 5), 45);
      points.push({ x: i * 10, value: clampedY });
    }

    return points;
  }, [pct, isFlat, seed, isPositive]);

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart
        data={data}
        margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
        className={className}
        style={style}
      >
        <defs>
          <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={gradientStart} stopOpacity={0.3} />
            <stop offset="100%" stopColor={gradientEnd} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <XAxis dataKey="x" hide />
        <YAxis domain={[5, 45]} hide />

        <Area
          type="natural"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1}
          fill={`url(#${gradientId})`}
          dot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};

BalanceChart.propTypes = {
  changePercent: PropTypes.oneOfType([PropTypes.number, PropTypes.string])
    .isRequired,
  balance: PropTypes.oneOfType([PropTypes.number, PropTypes.string]).isRequired,
  className: PropTypes.string,
  style: PropTypes.object,
};

export default BalanceChart;
