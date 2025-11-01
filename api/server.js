// Vercel serverless function handler
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Import and initialize the Express app
const app = require('../server.cjs');

// Export handler for Vercel
module.exports = (req, res) => {
  // Set VERCEL flag
  process.env.VERCEL = '1';
  
  // Handle the request with Express
  return app(req, res);
};
