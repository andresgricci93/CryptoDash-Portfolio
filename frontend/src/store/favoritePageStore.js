import { create } from 'zustand';

export const useFavoritePageStore = create((set) => ({
  // Tab state
  activeTab: 'pros&cons',
  
  // AI Responses for each tab
  prosAndConsResponse: '',
  factsResponse: '',
  reportsResponse: '',
  
  // Loading states
  prosAndConsLoading: false,
  factsLoading: false,
  reportsLoading: false,
  
  // Copy states
  prosAndConsCopied: false,
  factsCopied: false,
  reportsCopied: false,
  
  // Actions - Tab
  setActiveTab: (tab) => set({ activeTab: tab }),
  
  // Actions - Pros & Cons
  setProsAndConsResponse: (response) => set({ prosAndConsResponse: response }),
  setProsAndConsLoading: (loading) => set({ prosAndConsLoading: loading }),
  setProsAndConsCopied: (copied) => set({ prosAndConsCopied: copied }),
  
  // Actions - Facts
  setFactsResponse: (response) => set({ factsResponse: response }),
  setFactsLoading: (loading) => set({ factsLoading: loading }),
  setFactsCopied: (copied) => set({ factsCopied: copied }),
  
  // Actions - Reports
  setReportsResponse: (response) => set({ reportsResponse: response }),
  setReportsLoading: (loading) => set({ reportsLoading: loading }),
  setReportsCopied: (copied) => set({ reportsCopied: copied }),
  
  // Reset individual tabs
  clearProsAndCons: () => set({ 
    prosAndConsResponse: '', 
    prosAndConsCopied: false,
    prosAndConsLoading: false 
  }),
  clearFacts: () => set({ 
    factsResponse: '', 
    factsCopied: false,
    factsLoading: false 
  }),
  clearReports: () => set({ 
    reportsResponse: '', 
    reportsCopied: false,
    reportsLoading: false 
  }),
  
  // Reset everything 
  resetAll: () => set({
    activeTab: 'pros&cons',
    prosAndConsResponse: '',
    factsResponse: '',
    reportsResponse: '',
    prosAndConsLoading: false,
    factsLoading: false,
    reportsLoading: false,
    prosAndConsCopied: false,
    factsCopied: false,
    reportsCopied: false
  })
}));