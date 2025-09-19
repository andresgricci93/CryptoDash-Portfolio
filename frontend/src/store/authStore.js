import {create} from "zustand";
import axios from "axios";


const API_URL = `${import.meta.env.VITE_API_URL}/auth`;
const PROFILE_API_URL = "http://127.0.0.1:5000/api/profile";
axios.defaults.withCredentials = true;

export const useAuthStore = create((set) => ({
   user:null,
   isAuthenticated: false,
   error: null,
   isLoading: false,
   isCheckingAuth: true,
   message: null,

   login: async (email, password) => {
     set({isLoading: true, error: null});
     try {
      const response = await axios.post(`${API_URL}/login`, {email, password});
      set({
         isAuthenticated: true,
         user: response.data.user,
         error: null,
         isLoading: false,
      });
     } catch (error) {
       set({error: error.response?.data?.message || "Error Logging in", isLoading: false});
       throw error;
     }
   },
   logout: async () => {
     set({isLoading: true, error: null})
      try {
        await axios.post(`${API_URL}/logout`)
        set({user: null, isAuthenticated: false, error: null, isLoading: false})
      } catch (error) {
      set({error: "Error logging out", isLoading:false})
      throw error;
      }
   },
   signup: async(email,password,name) => {
    set({isLoading: true, error: null});
    try {
     const response = await axios.post(`${API_URL}/signup`, {email,password,name});
     set({user:response.data.user, isAuthenticated: true, isLoading: false});
    } catch (error) {
     set({error: error.response.data.message || "Error signing up", isLoading: false});
     throw error;
    }
   },
   verifyEmail: async (code) => {
		set({ isLoading: true, error: null });
		try {
			const response = await axios.post(`${API_URL}/verify-email`, { code });
			set({ user: response.data.user, isAuthenticated: true, isLoading: false });
			return response.data;
		} catch (error) {
			set({ error: error.response.data.message || "Error verifying email", isLoading: false });
			throw error;
		}
	},
  verifyCurrentPassword: async (password) => {
   try {
      const response = await axios.post(`${import.meta.env.VITE_API_URL}/auth/verify-current-password`, 
      { password }
    );
    return response.data.isValid;
   } catch (error) {
    console.log("Error verifying password:", error);
    return false;
   }
  },
   checkAuth: async () => {
      await new Promise((resolve) => setTimeout(resolve, 1000))
       set({isCheckingAuth: true, error: null});
       try {
        const response = await axios.get(`${API_URL}/check-auth`)
        console.log("response" + response);
        set({user: response.data.user, isAuthenticated:true, isCheckingAuth:false});
       } catch (error) {
        set({error: null, isCheckingAuth: false, isAuthenticated: false})
       }
   },
  updateProfile: async (profileData) => {

    set({isLoading: true, error: null});
     console.log('🔧 About to send request with data:', profileData);
     console.log('🔧 Axios defaults:', axios.defaults.withCredentials);
  
    try {
       const response = await axios.post(`${PROFILE_API_URL}/update-profile`, profileData); // Cambiar a POST


           set({
              user: response.data.user,
              isLoading: false,
              error: null
           });
        return response.data; 

    } catch (error) {
        // Handle different error cases
        const errorMessage = error.response?.data?.message || "Error updating profile";
        set({
          error: errorMessage,
          isLoading: false
        });
        throw error;
    }

  },
    uploadAvatar: async (formData) => {
    set({ isLoading: true, error: null });
    
    try {
      const response = await axios.post(`${PROFILE_API_URL}/upload-avatar`, formData);
      
      // Actualizar el user en el store con el nuevo avatar
      set({
        user: response.data.user,
        isLoading: false,
        error: null
      });
      
      return response.data;
      
    } catch (error) {
      const errorMessage = error.response?.data?.message || "Error uploading avatar";
      set({
        error: errorMessage,
        isLoading: false
      });
      throw error;
    }
  },
   forgotPassword: async (email) => {
      set({ isLoading:true, error:null })
      try {
        const response = await axios.post(`${API_URL}/forgot-password`, {email});
        set({message: response.data.message, isLoading: false})
      } catch (error) {
        set({
          isLoading: false,
          error: error.response.data.message || "Error sending reset password email",
        });
        throw error;
      }
   },
   resetPassword: async (token, password) => {
     set({ isLoading: true, error: null })
     try {
      const response = await axios.post(`${API_URL}/reset-password/${token}`, {password})
      set({message: response.data.message, isLoading: false})
     } catch (error) {
      set({
        isLoading: false,
        error: error.response.data.message || "Error resetting password",
      });
      throw error;
     }
   },
   changePassword: async (newPassword) => {
      set({ isLoading: true, error: null });
      try {
        const response = await axios.put(`${import.meta.env.VITE_API_URL}/auth/change-password`, {
          newPassword
        });
        set({ 
          message: response.data.message, 
          isLoading: false 
        });
        return response.data;
      } catch (error) {
        set({
          error: error.response?.data?.message || "Error changing password",
          isLoading: false
        });
        throw error;
      }
  },
   deleteAccount: async () => {
     try {
      const response = await axios.delete(`${API_URL}/delete-account/`)
      set({
        user: null,
        isAuthenticated:false,
        message: response.data.message
      
      })
     } catch (error) {
        set({
          error: error.response.data.message || "Error deleting account...",
        });
        throw error;
     }
   }
}))