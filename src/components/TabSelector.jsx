import React from "react";
import "./TabSelector.css";

/**
 * TabSelector component for switching between different data views
 *
 * @param {Object} props
 * @param {Array} props.tabs - Array of tab objects with id and label
 * @param {string} props.activeTab - ID of the currently active tab
 * @param {Function} props.onTabChange - Callback function when tab is changed
 */
const TabSelector = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="tab-selector">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`tab-button ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
          role="tab"
        >
          {tab.icon && <span className="tab-icon">{tab.icon}</span>}
          <span className="tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default TabSelector;
