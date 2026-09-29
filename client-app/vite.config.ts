import { fileURLToPath, URL } from 'node:url'

import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import { defineConfig } from 'vite'

const NODE_MODULES_DIRECTORY = '/node_modules/'
const VUE_PACKAGE_PATHS = ['/vue/', '/vue-router/', '/pinia/', '/@vue/']
const JAVASCRIPT_ASSET_PATH = 'assets/[name]-[hash].js'
const STATIC_ASSET_PATH = 'assets/[name]-[hash][extname]'
const VUE_CHUNK_NAME = 'vue'
const VENDOR_CHUNK_NAME = 'vendor'
// admin-panel uses Vite's default 5173
const DEV_SERVER_PORT = 5174

const getManualChunk = (moduleId: string): string | undefined => {
  if (!moduleId.includes(NODE_MODULES_DIRECTORY)) {
    return undefined
  }

  if (VUE_PACKAGE_PATHS.some((packagePath) => moduleId.includes(packagePath))) {
    return VUE_CHUNK_NAME
  }

  return VENDOR_CHUNK_NAME
}

export default defineConfig({
  plugins: [vue(), tailwindcss()],
  server: {
    port: DEV_SERVER_PORT,
    strictPort: true,
  },
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  build: {
    rollupOptions: {
      output: {
        entryFileNames: JAVASCRIPT_ASSET_PATH,
        chunkFileNames: JAVASCRIPT_ASSET_PATH,
        assetFileNames: STATIC_ASSET_PATH,
        manualChunks: getManualChunk,
      },
    },
  },
})
