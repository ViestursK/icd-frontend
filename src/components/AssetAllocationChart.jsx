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
  "#7d67ff", // primary purple
  "#627eea", // ethereum blue
  "#f7931a", // bitcoin orange
  "#f3ba2f", // binance yellow
  "#32c376", // green
  "#3f8cff", // light blue
  "#8247e5", // polygon purple
  "#00aed8", // solana blue
  "#ff4c4c", // error red
  "#9381ff", // light purple
  "#b3a5ff", // lightest purple
  "#6a57d9", // dark purple
];

// Get additional colors by adjusting opacity
const getColorWithOpacity = (hexColor, opacity) => {
  // Convert hex to RGB
  const r = parseInt(hexColor.slice(1, 3), 16);
  const g = parseInt(hexColor.slice(3, 5), 16);
  const b = parseInt(hexColor.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${opacity})`;
};

// Get more colors for large datasets
const getExtendedColorArray = (length) => {
  if (length <= COLORS.length) return COLORS.slice(0, length);

  const extendedColors = [...COLORS];
  let i = 0;

  while (extendedColors.length < length) {
    // Add variants of existing colors with different opacities
    extendedColors.push(
      getColorWithOpacity(COLORS[i % COLORS.length], 0.7 - (i % 3) * 0.15)
    );
    i++;
  }

  return extendedColors;
};

// Active shape for animation
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
        dy={-20}
        textAnchor="middle"
        fill="#f2f2fa"
        className="donut-center-label"
      >
        {payload.name}
      </text>
      <text
        x={cx}
        y={cy}
        textAnchor="middle"
        fill="#f2f2fa"
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
        dy={20}
        textAnchor="middle"
        fill="#9e9ea0"
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
      />
    </g>
  );
};

// Custom tooltip component
const CustomTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="custom-tooltip">
        <p className="tooltip-name">{data.name}</p>
        <p className="tooltip-value">
          {data.value.toLocaleString("en-US", {
            style: "currency",
            currency: "USD",
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}
        </p>
        <p className="tooltip-percent">{(data.percent * 100).toFixed(2)}%</p>
      </div>
    );
  }
  return null;
};

// Custom legend that handles the "Other" category specially
const CustomLegend = ({ payload, onClick }) => {
  return (
    <ul className="custom-legend">
      {payload.map((entry, index) => (
        <li
          key={`legend-item-${index}`}
          className="legend-item"
          onClick={() => onClick && onClick(entry.value)}
        >
          <span
            className="legend-color"
            style={{ backgroundColor: entry.color }}
          ></span>
          <span className="legend-text">{entry.value}</span>
        </li>
      ))}
    </ul>
  );
};

const AssetAllocationChart = ({
  data = [],
  title = "Asset Allocation",
  valueKey = "value",
  nameKey = "name",
  othersThreshold = 2, // Assets below this percentage will be grouped as "Others"
  minHeight = 300,
  loading = false,
}) => {
  const [activeIndex, setActiveIndex] = useState(0);

  // Reset active index when data changes
  useEffect(() => {
    setActiveIndex(0);
  }, [data]);

  // Process data to combine small values into "Others" category
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Calculate total value
    const totalValue = data.reduce(
      (sum, item) => sum + Number(item[valueKey] || 0),
      0
    );

    if (totalValue === 0) return [];

    // Calculate percentage for each item
    const dataWithPercent = data.map((item) => ({
      name: item[nameKey],
      value: Number(item[valueKey] || 0),
      percent: Number(item[valueKey] || 0) / totalValue,
      originalData: item,
    }));

    // Sort by value (descending)
    const sortedData = [...dataWithPercent].sort((a, b) => b.value - a.value);

    // Separate items below threshold
    const mainItems = [];
    const smallItems = [];

    sortedData.forEach((item) => {
      if (item.percent * 100 >= othersThreshold) {
        mainItems.push(item);
      } else {
        smallItems.push(item);
      }
    });

    // If we have small items, create an "Others" category
    if (smallItems.length > 0) {
      const othersValue = smallItems.reduce((sum, item) => sum + item.value, 0);
      mainItems.push({
        name: "Others",
        value: othersValue,
        percent: othersValue / totalValue,
        isOthers: true,
        items: smallItems,
      });
    }

    return mainItems;
  }, [data, nameKey, valueKey, othersThreshold]);

  // Calculate extended colors
  const chartColors = useMemo(() => {
    return getExtendedColorArray(processedData.length);
  }, [processedData.length]);

  // Handle pie sector hover
  const onPieEnter = (_, index) => {
    setActiveIndex(index);
  };

  // Handle legend item click
  const handleLegendClick = (dataName) => {
    const clickedIndex = processedData.findIndex(
      (item) => item.name === dataName
    );
    if (clickedIndex >= 0) {
      setActiveIndex(clickedIndex);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="asset-allocation-chart-container" style={{ minHeight }}>
        <h3 className="chart-title">{title}</h3>
        <div className="chart-loading">
          <div className="chart-loading-spinner"></div>
          <p>Loading data...</p>
        </div>
      </div>
    );
  }

  // Show empty state if no data
  if (!processedData.length) {
    return (
      <div className="asset-allocation-chart-container" style={{ minHeight }}>
        <h3 className="chart-title">{title}</h3>
        <div className="chart-empty-state">
          <div className="chart-empty-icon">📊</div>
          <p>No data available</p>
        </div>
      </div>
    );
  }

  return (
    <div className="asset-allocation-chart-container" style={{ minHeight }}>
      <h3 className="chart-title">{title}</h3>

      <div className="chart-content">
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              activeIndex={activeIndex}
              activeShape={renderActiveShape}
              data={processedData}
              cx="50%"
              cy="50%"
              innerRadius={60}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              onMouseEnter={onPieEnter}
            >
              {processedData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={chartColors[index % chartColors.length]}
                />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              content={<CustomLegend onClick={handleLegendClick} />}
              verticalAlign="bottom"
              height={36}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default AssetAllocationChart;
