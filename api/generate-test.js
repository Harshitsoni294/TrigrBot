const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '..', '.env') });

// Import the Express app
const app = require('../server.cjs');

// Export handler for Vercel
module.exports = app;
