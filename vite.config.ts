import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    host: '0.0.0.0',
    port: 5000,
    hmr: {
      port: 5000
    },
    watch: {
      // Enable polling for Docker/VMs to avoid change storms
      usePolling: true,
      interval: 300,
      // Ignore noisy/generated paths that can cause infinite reloads
      ignored: [
        "**/node_modules/**",
        "**/.git/**",
        "**/.idea/**",
        "**/.vscode/**",
        "**/env/**",
        "**/venv/**",
        "**/__pycache__/**",
        "**/backend/**",
        "**/media/**",
        "**/static/**",
        "**/staticfiles/**",
        "**/dist/**",
        "**/coverage/**",
        "**/*.log",
        "**/*.sqlite3",
      ]
    }
  },
  preview: {
    host: '0.0.0.0',
    port: 5000
  },
 
});
