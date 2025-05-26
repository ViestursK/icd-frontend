import PropTypes from "prop-types";
import "./Header.css";

const Header = ({ title, subtitle, actions }) => {
  return (
    <header className="ui-header">
      <div className="header-text">
        <h1 className="header-title">{title}</h1>
        {subtitle && <p className="header-subtitle">{subtitle}</p>}
      </div>

      {actions && (
        <div
          className="header-actions"
          style={{ minHeight: "40px", opacity: 1, visibility: "visible" }}
        >
          {actions}
        </div>
      )}
    </header>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  subtitle: PropTypes.string,
  actions: PropTypes.node,
};

export default Header;
