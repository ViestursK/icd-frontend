import { BrowserRouter as Router } from "react-router-dom";
import { Suspense, lazy } from "react";
import { AuthProvider } from "./context/AuthContext";
import { WalletProvider } from "./context/WalletContext";
import { ToastProvider } from "./context/ToastContext";
import { ThemeProvider } from "./context/ThemeContext";
import LoadingScreen from "./components/ui/LoadingScreen";
import ErrorBoundary from "./components/ui/ErrorBoundary";
import PremiumBackground from "./components/ui/PremiumBackground";
import { Helmet } from "react-helmet";
import "./styles/globals.css";

const AppRouter = lazy(() => import("./routes/AppRouter"));

function App() {
  return (
    <>
      <Helmet>
        <title>Decen</title>
        <meta name="description" content="Your all-in-one crypto dashboard" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/assets/DECEN_logo_nobckgrnd.webp" />
      </Helmet>

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
    </>
  );
}

export default App;
