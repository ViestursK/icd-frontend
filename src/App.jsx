import { BrowserRouter as Router } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./context/ToastContext";
import LoadingScreen from "./components/ui/LoadingScreen";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import "./components/ui/PremiumBackground";
import "./styles/globals.css";
import PremiumBackground from "./components/ui/PremiumBackground";

// Lazy load the router for better performance
const AppRouter = lazy(() => import("./routes/AppRouter"));

function App() {
  return (
    <ErrorBoundary>
      <PremiumBackground />
      <Router>
        <AuthProvider>
          <ToastProvider>
            <WalletProvider>
              <Suspense fallback={<LoadingScreen />}>
                <AppRouter />
              </Suspense>
            </WalletProvider>
          </ToastProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;
