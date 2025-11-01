const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

module.exports = function handler(req, res) {
  try {
    console.log('[vercel-ping] invoked:', req.method, 'url->', req.url, 'originalUrl->', req.originalUrl || '(n/a)');
  } catch (e) {}
  res.setHeader('Content-Type', 'application/json');
  res.statusCode = 200;
  res.end(JSON.stringify({ ok: true, time: Date.now() }));
};
