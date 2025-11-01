# AI Test Assistant - Vercel Deployment Guide

## Prerequisites
1. GitHub account
2. Vercel account (sign up at https://vercel.com)
3. MongoDB Atlas account (for database)

## Step-by-Step Deployment

### 1. Prepare Your Project

Make sure your `.env` file has these variables (DO NOT commit this file):
```env
MONGODB_URI=your_mongodb_connection_string
GEMINI_API_KEY=your_gemini_api_key
DEV_SERVER_PORT=4000
```

### 2. Push to GitHub

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - AI Test Assistant"

# Add your GitHub repository
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 3. Deploy to Vercel

#### Option A: Via Vercel Dashboard (Recommended)

1. Go to https://vercel.com/dashboard
2. Click "Add New" → "Project"
3. Import your GitHub repository
4. Vercel will auto-detect the configuration
5. **Add Environment Variables:**
   - Click "Environment Variables"
   - Add:
     - `MONGODB_URI` = your MongoDB connection string
     - `GEMINI_API_KEY` = your Gemini API key
6. Click "Deploy"

#### Option B: Via Vercel CLI

```bash
# Install Vercel CLI globally
npm install -g vercel

# Login to Vercel
vercel login

# Deploy (from project root)
vercel

# Follow the prompts:
# - Set up and deploy? Yes
# - Which scope? Select your account
# - Link to existing project? No
# - Project name? (press enter for default)
# - Directory? ./ (press enter)
# - Override settings? No

# Add environment variables
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

### 4. Configure Environment Variables in Vercel

After deployment, go to your project settings:
1. Navigate to: Project → Settings → Environment Variables
2. Add these variables for all environments (Production, Preview, Development):
   - `MONGODB_URI` = `mongodb+srv://username:password@cluster.mongodb.net/database`
   - `GEMINI_API_KEY` = `your_gemini_api_key_here`

### 5. Update Frontend API URL (if needed)

If your frontend makes API calls to localhost, update them to use relative URLs:

**Before:**
```javascript
fetch('http://localhost:4000/generate-test', ...)
```

**After:**
```javascript
fetch('/generate-test', ...)
```

Vercel will automatically route these to your serverless functions.

### 6. Test Your Deployment

1. Visit your Vercel URL (e.g., `https://your-project.vercel.app`)
2. Test the chatbot functionality
3. Check browser console for any errors
4. Verify API endpoints are working

## Project Structure

```
chatbot/
├── api/
│   └── server.js          # Vercel serverless function wrapper
├── src/
│   ├── components/        # React components
│   └── ...
├── server.cjs             # Express backend
├── vercel.json            # Vercel configuration
├── package.json           # Dependencies
└── .env                   # Environment variables (NOT committed)
```

## Local Development

```bash
# Install dependencies
npm install

# Start frontend (Vite dev server)
npm run dev

# Start backend (in another terminal)
node server.cjs
```

Frontend: http://localhost:5173
Backend: http://localhost:4000

## Troubleshooting

### MongoDB Connection Issues
- Ensure your MongoDB Atlas IP whitelist includes `0.0.0.0/0` for Vercel
- Check connection string format

### API Not Working
- Verify environment variables are set in Vercel
- Check Vercel function logs: Project → Deployments → Click deployment → Functions

### Build Failures
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json`
- Verify Node.js version compatibility

## Useful Commands

```bash
# View deployment logs
vercel logs

# Check deployment status
vercel inspect

# Remove deployment
vercel remove PROJECT_NAME

# Update environment variables
vercel env ls                    # List all variables
vercel env add VAR_NAME          # Add new variable
vercel env rm VAR_NAME           # Remove variable
```

## Important Notes

1. **Serverless Functions**: Vercel converts your Express server into serverless functions
2. **Cold Starts**: First request might be slower due to serverless cold starts
3. **Timeouts**: Vercel free tier has 10-second function timeout
4. **File Storage**: Use MongoDB or external storage (Vercel filesystem is ephemeral)
5. **WebSocket**: Not supported on Vercel (use alternative for real-time features)

## Support

For issues:
- Vercel Docs: https://vercel.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- GitHub Issues: Create an issue in your repository

## License

MIT
