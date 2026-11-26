import { createReadStream, statSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname, join, relative, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('./game/', import.meta.url)));
const portFlag = process.argv.indexOf('--port');
const port = Number(portFlag < 0 ? 8080 : process.argv[portFlag + 1]);
const listenPort = Number.isInteger(port) && port > 0 && port < 65536 ? port : 8080;
const mime = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.mjs', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8'],
  ['.jpg', 'image/jpeg'],
  ['.jpeg', 'image/jpeg'],
  ['.png', 'image/png'],
]);

function resolveRequest(pathname) {
  const decoded = decodeURIComponent(pathname);
  const requestPath = decoded.endsWith('/') ? `${decoded}index.html` : decoded;
  const file = resolve(root, `.${requestPath}`);
  const path = relative(root, file);
  if (path === '..' || path.startsWith(`..${sep}`) || file === root) return null;
  return file;
}

createServer((request, response) => {
  let file;
  try {
    file = resolveRequest(new URL(request.url ?? '/', 'http://localhost').pathname);
  } catch {
    response.writeHead(400).end('bad request');
    return;
  }
  if (!file) {
    response.writeHead(403).end('forbidden');
    return;
  }
  try {
    const info = statSync(file);
    if (!info.isFile()) throw new Error('not a file');
    response.writeHead(200, {
      'content-type': mime.get(extname(file).toLowerCase()) ?? 'application/octet-stream',
      'content-length': info.size,
      'cache-control': 'no-store',
    });
    createReadStream(file).pipe(response);
  } catch {
    response.writeHead(404).end('not found');
  }
}).listen(listenPort, '127.0.0.1', () => {
  console.log(`Limestone Wings is serving on http://127.0.0.1:${listenPort}`);
});
