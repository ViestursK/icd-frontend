// Create a new file: src/config/pollingConfig.js

/**
 * Global configuration for polling intervals
 * These settings control how frequently we fetch and update price data
 */
export const POLLING_CONFIG = {
  // How often the UI components check for price updates
  UI_POLL_INTERVAL: 5000, // 3 seconds

  // How often to poll DexScreener API
  DEXSCREENER_POLL_INTERVAL: 20000, // 20 seconds

  // Maximum number of concurrent tokens to track
  // Reduce this if performance becomes an issue
  MAX_TRACKED_TOKENS: 50,
};

export default POLLING_CONFIG;
