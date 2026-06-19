import { createServer } from 'node:http';
import { existsSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

function loadLocalEnv() {
  const envPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '.env.local');

  if (!existsSync(envPath)) {
    return;
  }

  const contents = readFileSync(envPath, 'utf8');

  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();

    if (!trimmed || trimmed.startsWith('#') || !trimmed.includes('=')) {
      continue;
    }

    const separatorIndex = trimmed.indexOf('=');
    const key = trimmed.slice(0, separatorIndex).trim();
    const value = trimmed.slice(separatorIndex + 1).trim().replace(/^"|"$/g, '');

    if (!(key in process.env)) {
      process.env[key] = value;
    }
  }
}

loadLocalEnv();

const { default: createRsvpHandler } = await import('./rsvps.ts');
const { default: createAdminHandler } = await import('./admin/rsvps.ts');

const port = Number(process.env.API_PORT ?? 3001);

const server = createServer(async (request, response) => {
  const requestUrl = new URL(request.url ?? '/', `http://${request.headers.host ?? '127.0.0.1'}`);
  const requestBody = await new Promise<Buffer>((resolve, reject) => {
    const chunks: Buffer[] = [];

    request.on('data', (chunk) => chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk)));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });

  let handler: ((req: Request) => Promise<Response>) | null = null;

  if (requestUrl.pathname === '/api/rsvps') {
    handler = createRsvpHandler;
  } else if (requestUrl.pathname === '/api/admin/rsvps') {
    handler = createAdminHandler;
  }

  if (!handler) {
    response.statusCode = 404;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: 'Not found' }));
    return;
  }

  try {
    const fetchRequest = new Request(requestUrl.toString(), {
      method: request.method,
      headers: request.headers as HeadersInit,
      body: requestBody.length > 0 ? requestBody.toString('utf8') : undefined,
    });

    const fetchResponse = await handler(fetchRequest);

    response.statusCode = fetchResponse.status;
    fetchResponse.headers.forEach((value, key) => response.setHeader(key, value));

    const body = Buffer.from(await fetchResponse.arrayBuffer());
    response.end(body);
  } catch (error) {
    console.error('API server error:', error);
    response.statusCode = 500;
    response.setHeader('Content-Type', 'application/json');
    response.end(JSON.stringify({ error: 'Internal server error' }));
  }
});

server.listen(port, () => {
  console.log(`API server running on http://127.0.0.1:${port}`);
});