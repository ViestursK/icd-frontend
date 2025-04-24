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
<<<<<<< HEAD
          <ToastProvider>
            <WalletProvider>
              <Suspense fallback={<LoadingScreen />}>
                <AppRouter />
              </Suspense>
            </WalletProvider>
          </ToastProvider>
=======
          <WalletProvider>
            <ToastProvider>
              <Suspense fallback={<LoadingScreen />}>
                <AppRouter />
              </Suspense>
            </ToastProvider>
          </WalletProvider>
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
        </AuthProvider>
      </Router>
    </ErrorBoundary>
  );
}

<<<<<<< HEAD
export default App;
=======
export default App;
>>>>>>> a87bd576852879aee5c02c8933cf5fb08adc9d1f
