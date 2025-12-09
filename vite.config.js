import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Add this section:
    allowedHosts: [
      "electrical-uncoddled-vanesa.ngrok-free.dev"
    ]
  }
})