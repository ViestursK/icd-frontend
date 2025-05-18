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
import "./AssetAllocationChart.css";

const COLORS = [
  "#7d67ff",
  "#627eea",
  "#f7931a",
  "#f3ba2f",
  "#32c376",
  "#3f8cff",
  "#8247e5",
  "#00aed8",
  "#ff4c4c",
  "#9381ff",
  "#b3a5ff",
  "#6a57d9",
];

const getColorWithOpacity = (hex, opacity) => {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

const getExtendedColorArray = (len) => {
  if (len <= COLORS.length) return COLORS.slice(0, len);
  const ext = [...COLORS];
  let i = 0;
  while (ext.length < len) {
    ext.push(
      getColorWithOpacity(COLORS[i % COLORS.length], 0.7 - (i % 3) * 0.15)
    );
    i++;
  }
  return ext;
};

const renderActiveShape = (props) => {
  const {
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
  } = props;
  return (
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
        outerRadius={outerRadius + 10}
        startAngle={startAngle}
        endAngle={endAngle}
        fill={fill}
      />
    </g>
  );
};

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

  useEffect(() => {
    setActiveIndex(0);
  }, [data]);

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
    if (small.length)
      main.push({
        name: "Others",
        value: small.reduce((s, i) => s + i.value, 0),
        percent: small.reduce((s, i) => s + i.value, 0) / total,
      });
    return main;
  }, [data, nameKey, valueKey, othersThreshold]);

  const colors = useMemo(
    () => getExtendedColorArray(processedData.length),
    [processedData.length]
  );
  const onPieEnter = (_, idx) => setActiveIndex(idx);
  const onLegendClick = (name) => {
    const i = processedData.findIndex((item) => item.name === name);
    if (i >= 0) setActiveIndex(i);
  };

  if (loading) {
    return (
      <div className="chart-loading-wrapper" style={{ minHeight }}>
        <div className="chart-loading-spinner" />
        <p>Loading...</p>
      </div>
    );
  }
  if (!processedData.length) {
    return (
      <div className="chart-empty-wrapper" style={{ minHeight }}>
        <div className="chart-empty-icon">📊</div>
        <p>No data</p>
      </div>
    );
  }

  return (
    <div
      className="asset-allocation-chart-container compact"
      style={{ minHeight }}
    >
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
