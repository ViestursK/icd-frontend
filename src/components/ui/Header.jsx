import React from "react";
import PropTypes from "prop-types";
import "./Header.css";

const Header = ({ title, subtitle, actions }) => {
  return (
    <header className="ui-header">
      <div className="header-text">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>

      {actions && <div className="header-actions">{actions}</div>}
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node, // Actions can be any React node (buttons, etc.)
};

export default Header;
