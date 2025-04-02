import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    tailwindcss(),
    react()
  ],
  preview: {
    port: 8080,
    strictPort: true,
  },
  server: {
    port: 3000,
    strictPort: true,
    host: "0.0.0.0",
    origin: "http://0.0.0.0:3000",
  },
  base: "/",
});
