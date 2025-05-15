const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Import the Express app
const app = require('../server.cjs');

// Export a handler that strips the mount prefix so Express routes match.
// Vercel mounts this file at /api/store-test, but the Express app
// defines routes like /store-test. We must remove the /api/store-test
// prefix from req.url before passing to the app.
module.exports = function handler(req, res, next) {
	try {
		const original = req.url || req.originalUrl || '/';
		req.url = original.replace(/^\/api\/store-test/, '') || '/';
	} catch (e) {
		// ignore
	}
	try { console.log('[vercel-wrapper] store-test:', req.method, 'originalUrl->', req.originalUrl || '(n/a)', 'mapped->', req.url); } catch (e) {}
	return app(req, res, next);
};
