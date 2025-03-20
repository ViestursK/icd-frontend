// /src/services/walletService.js
import api from "../api/api";  // Import the Axios instance

// Fetch wallets data from the backend
export const fetchWallets = async () => {
  try {
    const response = await api.get("/api/wallets/sync/");  
    return response.data.wallets;
  } catch (error) {
    console.error("Error fetching wallets:", error);
    throw error;  
  }
};
