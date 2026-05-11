import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// MIME types para archivos de los juegos
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js':   'application/javascript; charset=utf-8',
  '.mjs':  'application/javascript; charset=utf-8',
  '.css':  'text/css; charset=utf-8',
  '.json': 'application/json',
  '.png':  'image/png',
  '.jpg':  'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif':  'image/gif',
  '.svg':  'image/svg+xml',
  '.ico':  'image/x-icon',
  '.woff': 'font/woff',
  '.woff2':'font/woff2',
  '.ttf':  'font/ttf',
  '.glb':  'model/gltf-binary',
  '.gltf': 'model/gltf+json',
  '.ogg':  'audio/ogg',
  '.mp3':  'audio/mpeg',
  '.webm': 'video/webm',
}

// Middleware que sirve un directorio estático bajo un prefijo de ruta
function serveDir(dir) {
  return function (req, res, next) {
    let urlPath = decodeURIComponent((req.url || '/').split('?')[0])
    if (urlPath === '/' || urlPath === '') urlPath = '/index.html'
    const filePath = path.join(dir, urlPath)
    const ext = path.extname(filePath).toLowerCase()
    const ct  = MIME[ext] || 'application/octet-stream'
    const stream = fs.createReadStream(filePath)
    stream.on('error', () => next())
    stream.on('open', () => {
      res.setHeader('Content-Type', ct)
      res.setHeader('Access-Control-Allow-Origin', '*')
      stream.pipe(res)
    })
  }
}

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    {
      name: 'serve-minor-games',
      configureServer(server) {
        // Juegos Phaser (HTML estático, sin paso de build)
        // Ruta en repo: ../../juego-astrid   →  sirve en /juego-astrid/
        server.middlewares.use(
          '/juego-astrid',
          serveDir(path.resolve(__dirname, '../../juego-astrid'))
        )
        // Ruta en repo: ../../front-end/Juego_Academia_de_la_magia  →  sirve en /academia-magia/
        server.middlewares.use(
          '/academia-magia',
          serveDir(path.resolve(__dirname, '../../front-end/Juego_Academia_de_la_magia'))
        )
        // Nova Drive (TypeScript/Vite compilado): sirve el dist/ en /nova-drive/
        server.middlewares.use(
          '/nova-drive',
          serveDir(path.resolve(__dirname, '../../front-end/nova-drive/dist'))
        )
      },
    },
  ],
})
