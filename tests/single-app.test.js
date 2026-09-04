const test = require('node:test');
const assert = require('node:assert/strict');
const { spawn } = require('node:child_process');
const path = require('node:path');

function waitForServer(url, timeoutMs = 15000) {
  const start = Date.now();

  return new Promise((resolve, reject) => {
    const check = async () => {
      if (Date.now() - start > timeoutMs) {
        reject(new Error(`Timed out waiting for ${url}`));
        return;
      }

      try {
        const response = await fetch(url);
        if (response.ok) {
          resolve();
          return;
        }
      } catch (error) {
        // Retry until the server is ready.
      }

      setTimeout(check, 250);
    };

    check();
  });
}

test('single-host app serves the frontend and API from one origin', async () => {
  const cwd = path.join(__dirname, '..');
  const child = spawn(process.execPath, ['server.js'], {
    cwd,
    env: {
      ...process.env,
      PORT: '4010',
      MONGODB_URI: 'mongodb://127.0.0.1:27017/mpower-test',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  const logs = [];
  child.stdout.on('data', (chunk) => logs.push(chunk.toString()));
  child.stderr.on('data', (chunk) => logs.push(chunk.toString()));

  try {
    await waitForServer('http://127.0.0.1:4010/api/test');

    const apiResponse = await fetch('http://127.0.0.1:4010/api/test');
    const apiPayload = await apiResponse.json();
    assert.equal(apiResponse.status, 200);
    assert.equal(apiPayload.success, true);

    const homeResponse = await fetch('http://127.0.0.1:4010/');
    const html = await homeResponse.text();
    assert.equal(homeResponse.status, 200);
    assert.match(html, /MPower/i);
  } finally {
    child.kill('SIGTERM');
    await new Promise((resolve) => setTimeout(resolve, 300));
    if (!child.killed) {
      child.kill('SIGKILL');
    }
  }
});
