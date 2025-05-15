// Minimal debug handler for /api/generate-test
// This temporary handler helps confirm whether Vercel exposes the function path.
module.exports = async function handler(req, res) {
	try {
		console.log('[generate-test-debug] invoked', req.method, 'url->', req.url, 'originalUrl->', req.originalUrl || '(n/a)');
	} catch (e) {}

	if (req.method !== 'POST') {
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify({ ok: true, method: req.method, note: 'POST required for real endpoint' }));
	}

	// Attempt to read body (buffer) if available
	try {
		let body = '';
		for await (const chunk of req) body += chunk;
		let parsed = null;
		try { parsed = JSON.parse(body || '{}'); } catch (e) { parsed = { raw: body }; }
		console.log('[generate-test-debug] body:', Object.keys(parsed).length ? parsed : '(empty)');
		res.statusCode = 200;
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify({ ok: true, echoed: parsed }));
	} catch (err) {
		console.error('generate-test-debug error:', err && err.message ? err.message : err);
		res.statusCode = 500;
		res.setHeader('Content-Type', 'application/json');
		return res.end(JSON.stringify({ ok: false, error: (err && err.message) || String(err) }));
	}
};
