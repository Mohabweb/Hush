// Development runner: starts the API server (tsx) + Vite dev server.
import { spawn } from 'node:child_process';

const api = spawn('npx', ['tsx', 'watch', 'server/index.ts'], { stdio: 'inherit', shell: process.platform === 'win32' });
const client = spawn('npx', ['vite'], { stdio: 'inherit', shell: process.platform === 'win32' });

function stop() {
  api.kill();
  client.kill();
  process.exit(0);
}
process.on('SIGINT', stop);
process.on('SIGTERM', stop);
