import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// https://vitejs.dev/config/
export default defineConfig(() => {
  return {
    server: {
      host: true,
      port: 8080,
    },
    plugins: [react()],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks: {
            // Separa o Mapbox em um chunk separado para melhor cache
            'mapbox': ['mapbox-gl'],
            // Separa bibliotecas grandes
            'vendor': ['react', 'react-dom', 'react-router-dom'],
            // Separa UI components
            'ui': [
              '@/components/ui/tabs',
              '@/components/ui/card',
              '@/components/ui/button',
              '@/components/ui/badge',
              '@/components/ui/skeleton',
              '@/components/ui/alert'
            ],
          },
        },
        treeshake: true, // Tree shaking máximo
      },
      // Otimizações de build EXTREMAS para performance
      chunkSizeWarningLimit: 2000,
      minify: 'esbuild',
      // Source maps desativados para performance
      sourcemap: false,
      // Target moderno para melhor performance
      target: 'esnext',
    },
    // Otimizações de CSS
    css: {
      devSourcemap: false, // Desativa source maps de CSS em dev para velocidade
    },
  };
});
