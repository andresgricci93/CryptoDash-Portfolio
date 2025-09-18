import { create } from "zustand";
import { devtools } from 'zustand/middleware';
import axios from "axios";

const API_URL = `${import.meta.env.VITE_API_URL}/favorites`;

export const useFavoritesStore = create(
 devtools(
   (set, get) => ({
     favoriteIds: [],
     isLoading: false,
     error: null,
     
     addFavorite: async (cryptoId) => {
       set({ isLoading: true, error: null });
       try {
         const response = await axios.post(`${API_URL}/add`, { cryptoId });
         set({
           favoriteIds: response.data.favoriteCoins,
           error: null,
           isLoading: false,
         });
       } catch (error) {
         set({ error: error.response?.data?.message || "Error adding favorite", isLoading: false });
         throw error;
       }    
     },
     
     removeFavorite: async (cryptoId) => {
       set({ isLoading: true, error: null });
       try {
         const response = await axios.delete(`${API_URL}/remove`, { data: { cryptoId } });
         set({
           favoriteIds: response.data.favoriteCoins,
           error: null,
           isLoading: false,
         });
       } catch (error) {
         set({ error: error.response?.data?.message || "Error removing favorite", isLoading: false });
         throw error;
       }    
     },
     
     loadFavorites: async () => {
       set({ isLoading: true, error: null });
       try {
         const response = await axios.get(`${API_URL}`); 
         set({
           favoriteIds: response.data.favoriteCoins, 
           error: null,
           isLoading: false,
         });
       } catch (error) {
         set({ error: error.response?.data?.message || "Error loading favorites", isLoading: false });
       }
     }
   }),
   {
     name: 'favorites-store'
   }
 )
);