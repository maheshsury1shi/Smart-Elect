import { spawn } from 'node:child_process';
import { existsSync } from 'node:fs';
import path from 'node:path';
import process from 'node:process';

const rootDir = process.cwd();
const npmCommand = process.platform === 'win32' ? 'npm.cmd' : 'npm';

const services = [
  { name: 'backend', cwd: path.join(rootDir, 'backend'), color: '\x1b[36m' },
  { name: 'frontend', cwd: path.join(rootDir, 'frontend'), color: '\x1b[35m' },
];

const children = [];
let shuttingDown = false;

function prefixLines(text, prefix, color) {
  return text
    .split(/\r?\n/)
    .filter(Boolean)
    .map((line) => `${color}[${prefix}]\x1b[0m ${line}`)
    .join('\n');
}

function stopAll(exitCode = 0) {
  if (shuttingDown) return;
  shuttingDown = true;

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGINT');
    }
  }

  setTimeout(() => process.exit(exitCode), 150);
}

for (const service of services) {
  if (!existsSync(path.join(service.cwd, 'package.json'))) {
    console.error(`Missing package.json in ${service.cwd}`);
    process.exit(1);
  }

  const child = spawn(npmCommand, ['run', 'dev'], {
    cwd: service.cwd,
    stdio: ['inherit', 'pipe', 'pipe'],
    shell: false,
  });

  child.stdout.on('data', (chunk) => {
    const output = prefixLines(chunk.toString(), service.name, service.color);
    if (output) console.log(output);
  });

  child.stderr.on('data', (chunk) => {
    const output = prefixLines(chunk.toString(), service.name, service.color);
    if (output) console.error(output);
  });

  child.on('exit', (code) => {
    if (!shuttingDown && code && code !== 0) {
      console.error(`${service.name} exited with code ${code}`);
      stopAll(code);
    }
  });

  child.on('error', (error) => {
    console.error(`${service.name} failed to start: ${error.message}`);
    stopAll(1);
  });

  children.push(child);
}

process.on('SIGINT', () => stopAll(0));
process.on('SIGTERM', () => stopAll(0));
