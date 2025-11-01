const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Import the Express app
const app = require('../server.cjs');

// Export a handler that strips the mount prefix so Express routes match.
// Vercel mounts this file at /api/generate-test, but the Express app
// defines routes like /generate-test. We must remove the /api/generate-test
// prefix from req.url before passing to the app.
module.exports = function handler(req, res, next) {
  try {
    const original = req.url || req.originalUrl || '/';
    // Remove the exact prefix /api/generate-test (preserve querystring)
    req.url = original.replace(/^\/api\/generate-test/, '') || '/';
  } catch (e) {
    // ignore
  }
  // Log for debugging in Vercel function logs
  try { console.log('[vercel-wrapper] generate-test (orig):', req.method, 'originalUrl->', req.originalUrl || '(n/a)', 'mapped->', req.url); } catch (e) {}
  return app(req, res, next);
};
