// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  server: { // <--- ADD THIS SERVER CONFIGURATION BLOCK
    proxy: {
      // Requests to /api/* will be proxied to your backend server
      '/api': {
        target: 'http://localhost:5000', // Your backend server address
        changeOrigin: true, // Recommended: changes the origin of the host header to the target URL
        // secure: false,      // Uncomment if your backend uses HTTPS with a self-signed certificate (usually not needed for localhost HTTP)
        // rewrite: (path) => path.replace(/^\/api/, '') // DO NOT UNCOMMENT this line for your current setup,
        // as your backend routes already include /api
      }
    }
  }
})