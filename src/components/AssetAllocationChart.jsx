import React, { useState, useEffect, useMemo } from "react";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Legend,
  Tooltip,
  Sector,
} from "recharts";
import { FaChartPie } from "react-icons/fa";
import "./AssetAllocationChart.css";

// Theme-aware color palette that complements lime green
const getThemeColors = () => {
  const root = document.documentElement;
  const computedStyle = getComputedStyle(root);

  return {
    primary:
      computedStyle.getPropertyValue("--color-primary").trim() || "#84cc16",
    primaryLight:
      computedStyle.getPropertyValue("--color-primary-light").trim() ||
      "#a3e635",
    primaryDark:
      computedStyle.getPropertyValue("--color-primary-dark").trim() ||
      "#65a30d",
    success:
      computedStyle.getPropertyValue("--color-success").trim() || "#84cc16",
    error: computedStyle.getPropertyValue("--color-error").trim() || "#f87171",
    warning:
      computedStyle.getPropertyValue("--color-warning").trim() || "#fbbf24",
    info: computedStyle.getPropertyValue("--color-info").trim() || "#38bdf8",
  };
};

// Enhanced color palette that works beautifully with lime green theme
const getThemeAwareColors = () => {
  const themeColors = getThemeColors();

  return [
    themeColors.primary, // Lime green - primary accent
    "#627eea", // Ethereum blue - crypto standard
    "#f7931a", // Bitcoin orange - crypto standard
    themeColors.info, // Sky blue - complements lime
    "#8b5cf6", // Purple - contrasts with lime
    themeColors.warning, // Amber - warm complement
    "#f43f5e", // Rose - vibrant accent
    "#14b8a6", // Teal - cool complement
    "#f97316", // Orange - energy
    themeColors.primaryLight, // Light lime
    "#a855f7", // Violet - rich contrast
    "#06b6d4", // Cyan - fresh complement
    "#ef4444", // Red - strong contrast
    themeColors.primaryDark, // Dark lime
    "#8b5cf6", // Purple variant
    "#10b981", // Emerald - green family
  ];
};

const getColorWithOpacity = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getExtendedColorArray = (len, colors) => {
  if (len <= colors.length) return colors.slice(0, len);
  const ext = [...colors];
  let i = 0;
  while (ext.length < len) {
    ext.push(
      getColorWithOpacity(colors[i % colors.length], 0.8 - (i % 4) * 0.15)
    );
    i++;
  }
  return ext;
};

const renderActiveShape = ({
  cx,
  cy,
  innerRadius,
  outerRadius,
  startAngle,
  endAngle,
  fill,
  payload,
  value,
  percent,
}) => (
  <g>
    <text
      x={cx}
      y={cy}
      dy={-24}
      textAnchor="middle"
      className="donut-center-label"
    >
      {payload.name}
    </text>
    <text
      x={cx}
      y={cy}
      dy={0}
      textAnchor="middle"
      className="donut-center-value"
    >
      {value.toLocaleString("en-US", {
        style: "currency",
        currency: "USD",
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}
    </text>
    <text
      x={cx}
      y={cy}
      dy={24}
      textAnchor="middle"
      className="donut-center-percent"
    >
      {(percent * 100).toFixed(1)}%
    </text>
    <Sector
      cx={cx}
      cy={cy}
      innerRadius={innerRadius}
      outerRadius={outerRadius + 8}
      startAngle={startAngle}
      endAngle={endAngle}
      fill={fill}
      className="active-sector"
    />
  </g>
);

const CustomTooltip = ({ active, payload }) => {
  if (active && payload?.length) {
    const d = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-name">{d.name}</p>
        <p className="tooltip-value">
          {d.value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="tooltip-percent">{(d.percent * 100).toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

const CustomLegend = ({ payload, onClick }) => (
  <ul className="custom-legend">
    {payload.map((entry, i) => (
      <li
        key={i}
        className="legend-item"
        onClick={() => onClick?.(entry.value)}
      >
        <span
          className="legend-color"
          style={{ backgroundColor: entry.color }}
        />
        <span className="legend-text">{entry.value}</span>
      </li>
    ))}
  </ul>
);

const AssetAllocationChart = ({
  data = [],
  valueKey = "value",
  nameKey = "name",
  othersThreshold = 2,
  minHeight = 240,
  loading = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [themeColors, setThemeColors] = useState(getThemeAwareColors());

  useEffect(() => {
    setActiveIndex(0);
  }, [data]);

  // Listen for theme changes and update colors
  useEffect(() => {
    const updateColors = () => {
      setThemeColors(getThemeAwareColors());
    };

    updateColors();

    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "data-theme"
        ) {
          updateColors();
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["data-theme"],
    });

    return () => observer.disconnect();
  }, []);

  const processedData = useMemo(() => {
    const total = data.reduce(
      (sum, item) => sum + Number(item[valueKey] || 0),
      0
    );
    if (!total) return [];
    const withPct = data.map((item) => ({
      name: item[nameKey],
      value: Number(item[valueKey] || 0),
      percent: Number(item[valueKey] || 0) / total,
    }));
    const sorted = [...withPct].sort((a, b) => b.value - a.value);
    const main = [],
      small = [];
    sorted.forEach((item) =>
      item.percent * 100 >= othersThreshold ? main.push(item) : small.push(item)
    );
    if (small.length) {
      const othersValue = small.reduce((s, i) => s + i.value, 0);
      main.push({
        name: "Others",
        value: othersValue,
        percent: othersValue / total,
      });
    }
    return main;
  }, [data, nameKey, valueKey, othersThreshold]);

  const colors = useMemo(
    () => getExtendedColorArray(processedData.length || 4, themeColors),
    [processedData.length, themeColors]
  );

  const onPieEnter = (_, idx) => setActiveIndex(idx);
  const onLegendClick = (name) => {
    const i = processedData.findIndex((item) => item.name === name);
    if (i >= 0) setActiveIndex(i);
  };

  if (loading) {
    return <div className="shimmer-loading" />;
  }

  if (!processedData.length) {
    return (
      <div className="asset-allocation-chart-container" style={{ minHeight }}>
        <div className="chart-empty-wrapper" style={{ minHeight }}>
          <FaChartPie className="empty-state-icon" size={48} />
          <p className="empty-state-text">No allocation data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-allocation-chart-container" style={{ minHeight }}>
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            activeIndex={activeIndex}
            activeShape={renderActiveShape}
            data={processedData}
            cx="50%"
            cy="50%"
            innerRadius={50}
            outerRadius={70}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={onPieEnter}
          >
            {processedData.map((_, i) => (
              <Cell key={i} fill={colors[i % colors.length]} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend
            content={<CustomLegend onClick={onLegendClick} />}
            verticalAlign="bottom"
            height={24}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default AssetAllocationChart;
