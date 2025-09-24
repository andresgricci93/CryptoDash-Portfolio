import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { resolve } from 'path' 
// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
    server: {
    host: '127.0.0.1',
    port: 5173
  },
  resolve: { 
    alias: {
      '@': resolve(__dirname, './src'),
      '@components': resolve(__dirname, './src/components'),
      '@pages': resolve(__dirname, './src/pages'),
      '@store': resolve(__dirname, './src/store'),
      '@utils': resolve(__dirname, './src/utils')
    }
  }
})
