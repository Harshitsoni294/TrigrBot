// Vercel serverless function wrapper for Express server
// This file is kept as .js with CommonJS for Vercel compatibility
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Import the Express app
const app = require('../server.cjs');

// Export for Vercel serverless functions
module.exports = app;
