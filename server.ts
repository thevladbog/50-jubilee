import { createReadStream, existsSync, statSync } from 'node:fs';
import { createServer, type IncomingMessage, type ServerResponse } from 'node:http';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import createAdminHandler from './api/admin/rsvps.ts';
import createRsvpHandler from './api/rsvps.ts';

const serverDir = resolve(fileURLToPath(new URL('.', import.meta.url)));
const distDir = existsSync(join(serverDir, 'index.html')) ? serverDir : resolve(serverDir, 'dist');
const port = Number(process.env.PORT ?? 3000);

const mimeTypes: Record<string, string> = {
  '.css': 'text/css; charset=utf-8',
  '.html': 'text/html; charset=utf-8',
  '.ico': 'image/x-icon',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.svg': 'image/svg+xml',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
};

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);

  if (requestUrl.pathname === '/api/rsvps' || requestUrl.pathname === '/api/admin/rsvps') {
    await handleApiRequest(request, response, requestUrl);
    return;
  }

  serveStatic(requestUrl.pathname, response);
});

server.listen(port, () => {
  console.log(`Server running on http://0.0.0.0:${port}`);
});

async function handleApiRequest(
  request: IncomingMessage,
  response: ServerResponse,
  requestUrl: URL,
) {
  const requestBody = await new Promise<Buffer>((resolveBuffer, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    request.on('end', () => resolveBuffer(Buffer.concat(chunks)));
    request.on('error', reject);
  });
  const handler = requestUrl.pathname === '/api/rsvps' ? createRsvpHandler : createAdminHandler;

  try {
    const fetchRequest = new Request(requestUrl.toString(), {
      method: request.method,
      headers: request.headers as HeadersInit,
      body: requestBody.length > 0 ? requestBody.toString('utf8') : undefined,
    });
    const fetchResponse = await handler(fetchRequest);

    response.statusCode = fetchResponse.status;
    fetchResponse.headers.forEach((value, key) => response.setHeader(key, value));
    response.end(Buffer.from(await fetchResponse.arrayBuffer()));
  } catch (error) {
    console.error('API server error:', error);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
}

function serveStatic(pathname: string, response: ServerResponse) {
  const requestedPath = normalize(decodeURIComponent(pathname)).replace(/^(\.\.[/\\])+/, '');
  let filePath = resolve(join(distDir, requestedPath));

  if (!filePath.startsWith(distDir)) {
    response.statusCode = 403;
    response.end('Forbidden');
    return;
  }

  if (!existsSync(filePath) || statSync(filePath).isDirectory()) {
    filePath = resolve(distDir, 'index.html');
  }

  if (!existsSync(filePath)) {
    response.statusCode = 404;
    response.end('Not found');
    return;
  }

  response.setHeader('Content-Type', mimeTypes[extname(filePath)] ?? 'application/octet-stream');
  createReadStream(filePath).pipe(response);
}
