import { spawn } from 'node:child_process';
import { mkdirSync, readFileSync, writeFileSync, rmSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { setPriority, constants } from 'node:os';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const command = process.argv[2];
if (!['dev', 'build', 'start'].includes(command)) throw new Error('Expected dev, build, or start.');
const lock = resolve(root, '.cache/compiler.lock');
const compiler = command !== 'start';
if (compiler) {
  mkdirSync(dirname(lock), { recursive: true });
  try { mkdirSync(lock); }
  catch (error) {
    if (error.code !== 'EEXIST') throw error;
    let owner;
    try { owner = JSON.parse(readFileSync(resolve(lock, 'owner.json'), 'utf8')); } catch { /* Incomplete lock: fail closed. */ }
    let running = true;
    if (owner?.pid) {
      try { process.kill(owner.pid, 0); }
      catch (error) { running = error.code !== 'ESRCH'; }
    }
    if (running) {
      console.error(`A ${owner?.command ?? 'compilation'} process is already running. Stop it with Ctrl+C before starting another dev server or build.`);
      process.exit(1);
    }
    rmSync(lock, { recursive: true }); mkdirSync(lock);
  }
  writeFileSync(resolve(lock, 'owner.json'), JSON.stringify({ pid: process.pid, command }));
  // Let foreground applications take priority over compilation on the local laptop.
  try { setPriority(0, constants.priority.PRIORITY_BELOW_NORMAL); } catch { /* Unsupported platform. */ }
}
const heap = command === 'build' ? 2048 : 1536;
const args = [command, ...(compiler ? ['--webpack'] : []), ...process.argv.slice(3)];
const child = spawn(process.execPath, [resolve(root, 'node_modules/next/dist/bin/next'), ...args], {
  cwd: root, stdio: 'inherit', env: {
    ...process.env,
    NODE_OPTIONS: `${process.env.NODE_OPTIONS ?? ''} --max-old-space-size=${heap}`.trim(),
    RAYON_NUM_THREADS: '2',
  },
});
function unlock() { if (compiler) rmSync(lock, { recursive: true, force: true }); }
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => child.kill(signal));
child.on('error', error => { unlock(); console.error(error.message); process.exit(1); });
child.on('exit', (code, signal) => { unlock(); process.exit(code ?? (signal === 'SIGINT' ? 130 : 1)); });
