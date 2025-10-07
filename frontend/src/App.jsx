
import { useEffect,useState } from "react";

import LoadingSpinner from "./components/LoadingSpinner.jsx";
import FloatingShape from "./components/FloatingShape.jsx"

import { Navigate, Route, Routes } from "react-router-dom";
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


const store = useFavoritesStore.getState();
console.log('Current favorites:', store.favoriteIds);

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
  
  const {isCheckingAuth, checkAuth } = useAuthStore();
  const { loadFavorites } = useFavoritesStore();
 const { loadUserCurrency } = useCurrencyStore();

  const { fetchRatesIfNeeded } = useCurrencyStore();
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initialize = async () => {

    
    await checkAuth();
    console.log('CheckAuth completed, authenticated:', useAuthStore.getState().isAuthenticated);
    
    await loadUserCurrency();    
    await fetchRatesIfNeeded();
    console.log('FetchRates completed');
    
    await loadFavorites(); 
    console.log('Setting isInitialized to true');
    setIsInitialized(true);
    };
    
    initialize();
  }, [loadFavorites]);
  
  if (isCheckingAuth || !isInitialized) return <LoadingSpinner />


  return (
    <div className="min-h-screen bg-gradient-to-br 
    from-gray-900 via-green-900 to-emerald-900 flex items-center
     relative w-full justify-center">
    <div className="absolute inset-0 overflow-hidden">
     <FloatingShape color="bg-green-500" size="w-64 h-64" top="-5%" left="10%" delay={0} />
     <FloatingShape color="bg-emerald-500" size="w-48 h-48" top="70%" left="80%" delay={5} />
     <FloatingShape color="bg-lime-500" size="w-32 h-32" top="40%" left="-10%" delay={2} />
    </div>  
      
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
       <Route path="/verify-email" element={
        <RedirectAuthenticatedUser>
          <EmailVerificationPage />
        </RedirectAuthenticatedUser>      
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
