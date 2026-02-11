import { resolve } from 'node:path'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import vuejsx from '@vitejs/plugin-vue-jsx'
import { defineConfig } from 'electron-vite'
// import monacoEditorPlugin from 'vite-plugin-monaco-editor'

export default defineConfig({
  main: {
    resolve: {
      alias: {
        '~': resolve('src'),
      },
    },
    build: {
      rollupOptions: {
        output: {
          format: 'es',
        },
      },
      // externalizeDeps: {
      //   exclude: ['better-sqlite3'],
      // },
    },
  },
  preload: {
    build: {
      rollupOptions: {
        output: {
          format: 'es',
        },
      },
      // externalizeDeps: {
      //   exclude: ['better-sqlite3'],
      // },
    },
  },
  renderer: {
    resolve: {
      alias: {
        '@': resolve('src/renderer/src'),
        '~': resolve('src'),
      },
    },

    plugins: [vue(), vuejsx(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: 'http://172.16.34.31:3001',
          changeOrigin: true,
          rewrite: path => path.replace(/^\/api/, ''),
          headers: {
            Connection: 'keep-alive',
          },
        },
      },
    },
  },
})
