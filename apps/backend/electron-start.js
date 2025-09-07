// apps/backend/electron-start.js (CommonJS)
const http = require('http');

let server;
let portInUse = 0;

function isExpressApp(obj) {
  // Express app is a function with .use/.set/.listen props
  return typeof obj === 'function' && obj.use && obj.set && obj.listen;
}

async function loadApp() {
  const exported = require('./src/app'); // <- adjust path if needed

  // If the export is already an Express app instance, return it directly.
  if (isExpressApp(exported)) return exported;

  // Otherwise, assume it's a factory that returns an app instance.
  const maybeApp = typeof exported === 'function' ? await exported() : exported;
  if (!isExpressApp(maybeApp)) {
    throw new Error('src/app did not export an Express app or a factory that returns one');
  }
  return maybeApp;
}

async function startServer() {
  if (portInUse) return portInUse;

  const app = await loadApp();
  const desired = Number(process.env.PORT) || 5050;

  await new Promise((resolve, reject) => {
    server = http.createServer(app);

    // Try desired port first
    server.once('error', (err) => {
      if (err && err.code === 'EADDRINUSE') {
        // Fall back to any free port
        server.removeAllListeners('error');
        server.listen(0, '127.0.0.1');
      } else {
        reject(err);
      }
    });

    server.once('listening', () => {
      portInUse = server.address().port;
      resolve();
    });

    server.listen(desired, '127.0.0.1');
  });

  return portInUse;
}

module.exports = { startServer };
