import { spawn } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

function startProcess(label, args) {
  const child = spawn(npmCommand, args, {
    cwd: rootDir,
    stdio: 'inherit',
    shell: true,
  });

  child.on('exit', (code, signal) => {
    if (signal) {
      process.exitCode = 1;
      return;
    }

    if (code && code !== 0) {
      process.exitCode = code;
    }
  });

  return child;
}

const client = startProcess('client', ['run', 'dev:client']);
const api = startProcess('api', ['run', 'dev:api']);

function shutdown() {
  client.kill();
  api.kill();
}

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);