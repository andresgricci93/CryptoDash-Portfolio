
import { useEffect, useState } from "react";

import LoadingSpinner from "./components/LoadingSpinner.jsx";


import { Navigate, Route, Routes, useParams, useNavigate } from "react-router-dom";
import { useAuthStore } from './store/authStore.js';
import { Toaster } from "react-hot-toast";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";
import Dashboard from "./components/Dashboard.jsx"
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import { useFavoritesStore } from './store/favStore.js';
import { useCurrencyStore } from "./store/currencyStore.js";
import FloatingLines from './components/common/FloatingLines.jsx'

const store = useFavoritesStore.getState();


// protect routes that require authentication

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, user } = useAuthStore();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (user && !user?.isVerified) {
    return <Navigate to="/verify-email" replace />
  }
  //comm
  return children;
}

// redirect authenticated users to the homepage
const RedirectAuthenticatedUser = ({ children }) => {

  const { isAuthenticated, user } = useAuthStore();

  if (isAuthenticated && user.isVerified) {
    return <Navigate to="/" replace />
  }
  return children;
}


const MagicLinkRedirect = () => {
  const { token } = useParams();
  const { validateMagicLink, isAuthenticated, error } = useAuthStore();
  const navigate = useNavigate();
  const [isValidating, setIsValidating] = useState(true);

  useEffect(() => {
    const handleMagicLink = async () => {
      try {
        await validateMagicLink(token);

      } catch (err) {
        console.error('Magic link validation failed:', err);

      } finally {
        setIsValidating(false);
      }
    };

    handleMagicLink();
  }, [token]);

  useEffect(() => {
    if (!isValidating) {
      if (isAuthenticated) {
        navigate('/dashboard', { replace: true });
      } else if (error) {
        navigate('/login', { replace: true });
      }
    }
  }, [isValidating, isAuthenticated, error, navigate]);

  return <LoadingSpinner />;
};

function App() {

  const { loadFavorites } = useFavoritesStore();
  const { loadUserCurrency } = useCurrencyStore();
  const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
  const { fetchRatesIfNeeded } = useCurrencyStore();
  const [isLoadingUserData, setIsLoadingUserData] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {

    const initialize = async () => {

      await checkAuth();
      setIsInitialized(true);
    };

    initialize();
  }, []);

  useEffect(() => {
    if (isAuthenticated) {
      const loadUserData = async () => {
        setIsLoadingUserData(true);
        await loadUserCurrency();
        await fetchRatesIfNeeded();
        await loadFavorites();
        setIsLoadingUserData(false);
      };

      loadUserData();
    }
  }, [isAuthenticated]);

  if (isCheckingAuth || !isInitialized || isLoadingUserData) return <LoadingSpinner />


  return (
    <div className="min-h-screen bg-gray-900 flex items-center relative w-full justify-center">

      {!isAuthenticated && (
        <div className="fixed inset-0 z-0">
          <FloatingLines
            linesGradient={['#1F2937', '#1F2937', '#1F2937', '#1F2937']}
            enabledWaves={['middle']}
            lineCount={[4, 6, 4]}
            animationSpeed={0.8}
            interactive={true}
            parallax={true}
            parallaxStrength={0.15}
          />
        </div>
      )}

      <Routes>
        <Route path="/" element={
          <ProtectedRoute>
            <Navigate to="/dashboard" replace />
          </ProtectedRoute>
        } />


        <Route path="/*" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/signup" element={
          <RedirectAuthenticatedUser>
            <SignUpPage />
          </RedirectAuthenticatedUser>
        } />
        <Route path="/login" element={
          <RedirectAuthenticatedUser>
            <LoginPage />
          </RedirectAuthenticatedUser>

        } />
        <Route path="/access/:token" element={<MagicLinkRedirect />} />
        <Route path="/verify-email" element={
          <EmailVerificationPage />
        } />
        <Route path="/forgot-password" element={
          <RedirectAuthenticatedUser>
            <ForgotPasswordPage />
          </RedirectAuthenticatedUser>
        } />
        <Route
          path="/reset-password/:token"
          element={

            <RedirectAuthenticatedUser>
              <ResetPasswordPage />
            </RedirectAuthenticatedUser>
          }
        />
      </Routes>
      <Toaster />
    </div>
  )
}

export default App
