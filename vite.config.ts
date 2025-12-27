import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';
// recreate __dirname
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    https: {
      key: fs.readFileSync(
        path.resolve(__dirname, 'certificates/localhost-key.pem')
      ),
      cert: fs.readFileSync(
        path.resolve(__dirname, 'certificates/localhost.pem')
      ),
    },
    open: false,
    cors: true,
  },
  build: {
    outDir: 'dist',
  },
});
