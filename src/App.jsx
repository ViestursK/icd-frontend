import { BrowserRouter as Router } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./context/ToastContext";
import LoadingScreen from "./components/ui/LoadingScreen";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import "./styles/globals.css";

// Lazy load the router for better performance
const AppRouter = lazy(() => import("./routes/AppRouter"));

function App() {
  return (
    <ErrorBoundary>
      <Router>
        <AuthProvider>
          <WalletProvider>
            <ToastProvider>
              <Suspense fallback={<LoadingScreen />}>
                <AppRouter />
              </Suspense>
            </ToastProvider>
          </WalletProvider>
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

export default App;