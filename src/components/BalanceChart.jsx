import React, { useMemo } from "react";
import PropTypes from "prop-types";
import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis } from "recharts";

const BalanceChart = ({
  changePercent,
  balance,
  className = "",
  style = {},
}) => {
  const pct = parseFloat(changePercent) || 0;
  const bal = parseFloat(balance) || 0;
  const isPositive = pct > 0;
  const isNegative = pct < 0;
  const isFlat = pct === 0 && bal === 0;

  const strokeColor = isFlat ? "#aaa" : isPositive ? "#32c376" : "#ff4c4c";
  const gradientStart = isFlat
    ? "rgba(180,180,180,0.3)"
    : isPositive
    ? "rgba(50,195,118,0.2)"
    : "rgba(255,76,76,0.2)";
  const gradientEnd = "rgba(28,24,51,0)";

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
            <stop offset="0%" stopColor={gradientStart} stopOpacity={0.8} />
            <stop offset="100%" stopColor={gradientEnd} stopOpacity={0.1} />
          </linearGradient>
        </defs>

        <XAxis dataKey="x" hide />
        <YAxis domain={[5, 45]} hide />

        <Area
          type="natural"
          dataKey="value"
          stroke={strokeColor}
          strokeWidth={1.2}
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
