import { BrowserRouter as Router } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext"; // Import ThemeProvider
import LoadingScreen from "./components/ui/LoadingScreen";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import PremiumBackground from "./components/ui/PremiumBackground";
import "./styles/globals.css";

// Lazy load the router for better performance
const AppRouter = lazy(() => import("./routes/AppRouter"));

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <AuthProvider>
            <ToastProvider>
              <WalletProvider>
                <PremiumBackground />
                <Suspense fallback={<LoadingScreen />}>
                  <AppRouter />
                </Suspense>
              </WalletProvider>
            </ToastProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;
