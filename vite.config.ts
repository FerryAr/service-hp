import { defineConfig, normalizePath } from 'vite'
import { fileURLToPath } from 'url';
import path, { resolve } from 'path'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
// export default defineConfig({
//   plugins: [vue()],
// })

export default defineConfig(({ mode}) => {
  const __filename = fileURLToPath(import.meta.url);
  const __dirname = path.dirname(__filename);

  return {
    server: {
      allowedHosts: true
    },
    plugins: [vue()],
    resolve: {
      alias: {
        '@': normalizePath(resolve(__dirname, 'src')),
      }
    }
  }
})