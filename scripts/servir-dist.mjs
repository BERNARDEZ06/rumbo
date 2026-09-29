// Sirve la versión final (dist/) en http://localhost:4173/rumbo/, igual que la publicará GitHub Pages.
// Uso: node scripts/servir-dist.mjs   (antes: npm run build)
import { createServer } from 'node:http'
import { readFile } from 'node:fs/promises'
import { extname, join, normalize } from 'node:path'

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.webmanifest': 'application/manifest+json',
  '.json': 'application/json',
}
const PREFIJO = '/rumbo/'

createServer(async (req, res) => {
  const ruta = decodeURIComponent(new URL(req.url, 'http://x').pathname)
  if (!ruta.startsWith(PREFIJO)) {
    res.writeHead(404).end('No encontrado')
    return
  }
  let archivo = normalize(join('dist', ruta.slice(PREFIJO.length) || 'index.html'))
  if (!archivo.startsWith('dist')) {
    res.writeHead(403).end()
    return
  }
  try {
    const contenido = await readFile(archivo)
    res.writeHead(200, { 'Content-Type': TIPOS[extname(archivo)] ?? 'application/octet-stream' }).end(contenido)
  } catch {
    res.writeHead(404).end('No encontrado')
  }
}).listen(4173, () => console.log('Sirviendo dist/ en http://localhost:4173/rumbo/'))
