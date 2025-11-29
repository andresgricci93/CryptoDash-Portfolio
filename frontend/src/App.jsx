
import { useEffect,useState } from "react";

import LoadingSpinner from "./components/LoadingSpinner.jsx";


import { Navigate, Route, Routes } from "react-router-dom";
import { useAuthStore } from './store/authStore.js';
import { Toaster } from "react-hot-toast";
import AuthLayout from "./components/layouts/AuthLayout.jsx";
import SignUpPage from "./pages/SignUpPage.jsx";
import LoginPage from "./pages/LoginPage.jsx";
import EmailVerificationPage from "./pages/EmailVerificationPage.jsx";
import Dashboard from "./components/Dashboard.jsx"
import ForgotPasswordPage from "./pages/ForgotPasswordPage.jsx";
import ResetPasswordPage from "./pages/ResetPasswordPage.jsx";
import { useFavoritesStore } from './store/favStore.js';
import { useCurrencyStore } from "./store/currencyStore.js";


const store = useFavoritesStore.getState();


// protect routes that require authentication

const ProtectedRoute = ({children}) => {
  const {isAuthenticated, user} = useAuthStore();

  if(!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if(user && !user?.isVerified) {
    return <Navigate to="/verify-email" replace />
  }
//comm
  return children;
}

// redirect authenticated users to the homepage
const RedirectAuthenticatedUser = ({children}) => {

   const {isAuthenticated, user} = useAuthStore();

   if (isAuthenticated && user.isVerified) {
     return <Navigate to="/" replace />
   }
   return children;
}

function App() {
  
  const { loadFavorites } = useFavoritesStore();
  const { loadUserCurrency } = useCurrencyStore();
  const { isAuthenticated, isCheckingAuth, checkAuth } = useAuthStore();
  const { fetchRatesIfNeeded } = useCurrencyStore();
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
        await loadUserCurrency();
        await fetchRatesIfNeeded();
        await loadFavorites();
      };
      
      loadUserData();
    }
  }, [isAuthenticated]);
  
  if (isCheckingAuth || !isInitialized) return <LoadingSpinner />


  return (
    <div className="min-h-screen bg-gradient-to-br 
    from-gray-900 via-green-900 to-emerald-900 flex items-center
     relative w-full justify-center">

      
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
          <AuthLayout>
           <SignUpPage />
          </AuthLayout>
        </RedirectAuthenticatedUser>
      } />
       <Route path="/login" element={
        <RedirectAuthenticatedUser>
          <AuthLayout>
          <LoginPage />
         </AuthLayout>
        </RedirectAuthenticatedUser>

       } />
       <Route path="/verify-email" element={
          <AuthLayout>
            <EmailVerificationPage />
          </AuthLayout>
    
      } />
       <Route path="/forgot-password" element={
        
        <RedirectAuthenticatedUser>
          <AuthLayout>
           <ForgotPasswordPage />
          </AuthLayout>
        </RedirectAuthenticatedUser>      
      } />
      <Route
       path="/reset-password/:token"
       element={

        <RedirectAuthenticatedUser>
          <AuthLayout>
           <ResetPasswordPage />   
          </AuthLayout>
        </RedirectAuthenticatedUser>
       }
       />
     </Routes>
     <Toaster />
    </div>
  )
}

export default App
