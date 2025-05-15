const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Import the Express app
const app = require('../server.cjs');

// Export a handler that strips the mount prefix so Express routes match.
// Vercel mounts this file at /api/fetch-test, but the Express app
// defines routes like /fetch-test. We must remove the /api/fetch-test
// prefix from req.url before passing to the app.
module.exports = function handler(req, res, next) {
	try {
		const original = req.url || req.originalUrl || '/';
		req.url = original.replace(/^\/api\/fetch-test/, '') || '/';
	} catch (e) {
		// ignore
	}
	return app(req, res, next);
};
