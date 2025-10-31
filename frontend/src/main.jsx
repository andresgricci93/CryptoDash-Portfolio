import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import { BrowserRouter } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { ReactQueryDevtools } from '@tanstack/react-query-devtools'

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 5 * 60 * 1000,       
      cacheTime: 10 * 60 * 1000,      
      refetchOnWindowFocus: false,    
      retry: 1,                        
    },
  },
});



createRoot(document.getElementById('root')).render(
  <StrictMode>
    <BrowserRouter>
    <QueryClientProvider client={queryClient}>

     <App />
    {import.meta.env.MODE === 'development' && (
      <ReactQueryDevtools initialIsOpen={false} />
    )}
    </QueryClientProvider>
    </BrowserRouter>
  </StrictMode>,
)
