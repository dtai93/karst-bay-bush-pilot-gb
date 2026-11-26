// Tiny static file server for the game folder. No dependencies.
//   node serve.ts
//   node serve.ts --port 18820
// Then open http://127.0.0.1:<port>/

import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, normalize, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const gameRoot = resolve(fileURLToPath(new URL('./game/', import.meta.url)));

function portFromArgs(): number {
  const index = process.argv.indexOf('--port');
  const raw = index === -1 ? '8080' : process.argv[index + 1];
  const value = Number(raw);
  if (!Number.isInteger(value) || value < 1 || value > 65535) return 8080;
  return value;
}

const port = portFromArgs();

const mime: Record<string, string> = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.webp': 'image/webp',
  '.wav': 'audio/wav',
  '.mp3': 'audio/mpeg',
  '.ogg': 'audio/ogg',
  '.txt': 'text/plain; charset=utf-8',
  '.glb': 'model/gltf-binary',
  '.wasm': 'application/wasm',
};

function isInside(file: string): boolean {
  return file === gameRoot || file.startsWith(gameRoot + sep);
}

createServer((request, response) => {
  let pathname = '/';
  try {
    pathname = decodeURIComponent(new URL(request.url ?? '/', 'http://127.0.0.1').pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (pathname.endsWith('/')) pathname += 'index.html';
  const file = resolve(join(gameRoot, normalize(pathname)));
  if (!isInside(file)) {
    response.writeHead(403).end('forbidden');
    return;
  }
  let size = 0;
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('not a file');
    size = info.size;
  } catch {
    response.writeHead(404).end('not found');
    return;
  }
  const type = mime[extname(file).toLowerCase()] ?? 'application/octet-stream';
  response.writeHead(200, {
    'content-type': type,
    'content-length': size,
    'cache-control': 'no-store',
  });
  createReadStream(file).pipe(response);
}).listen(port, '127.0.0.1', () => {
  console.log(`Limestone Wings on http://127.0.0.1:${port}/`);
});
