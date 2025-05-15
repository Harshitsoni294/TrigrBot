# Quick Deployment Guide 🚀

## What's Been Set Up

✅ Vercel configuration (`vercel.json`)
✅ API serverless function wrapper (`api/server.js`)
✅ Updated server.cjs for Vercel compatibility
✅ Updated package.json with build scripts
✅ Updated .gitignore for security
✅ PowerShell deployment script (`deploy.ps1`)

## Quick Start - Deploy in 3 Steps

### Method 1: GitHub + Vercel (Easiest)

1. **Push to GitHub:**
   ```bash
   git add .
   git commit -m "Deploy to Vercel"
   git push origin main
   ```

2. **Deploy on Vercel:**
   - Go to https://vercel.com
   - Click "New Project"
   - Import your GitHub repo
   - Add environment variables (see below)
   - Click "Deploy"

3. **Add Environment Variables in Vercel:**
   - `MONGODB_URI` = your MongoDB connection string
   - `GEMINI_API_KEY` = your Gemini API key

### Method 2: PowerShell Script

Run in PowerShell:
```powershell
.\deploy.ps1
```

### Method 3: Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Add environment variables
vercel env add MONGODB_URI
vercel env add GEMINI_API_KEY

# Deploy to production
vercel --prod
```

## Environment Variables (IMPORTANT!)

Add these in Vercel Dashboard → Your Project → Settings → Environment Variables:

| Variable | Value | Example |
|----------|-------|---------|
| `MONGODB_URI` | Your MongoDB connection string | `mongodb+srv://user:pass@cluster.mongodb.net/db` |
| `GEMINI_API_KEY` | Your Google Gemini API key | `AIzaSy...` |

## MongoDB Atlas Setup

1. Go to https://cloud.mongodb.com
2. Go to Security → Network Access
3. Click "Add IP Address"
4. Select "Allow Access from Anywhere" (`0.0.0.0/0`)
5. This allows Vercel to connect to your database

## After Deployment

Your app will be live at: `https://your-project.vercel.app`

- Frontend: Automatically served
- Backend API: Available at `/generate-test`, `/store-test`, `/fetch-test`

## Files Created/Modified

```
✅ vercel.json              - Vercel configuration
✅ api/server.js            - Serverless function wrapper
✅ server.cjs               - Updated for Vercel
✅ package.json             - Added vercel-build script
✅ .gitignore               - Added .env, .vercel
✅ DEPLOYMENT.md            - Full deployment guide
✅ deploy.ps1               - PowerShell deployment helper
```

## Troubleshooting

**Build fails?**
- Check Vercel build logs
- Verify all dependencies are in package.json

**API doesn't work?**
- Make sure environment variables are set in Vercel
- Check function logs in Vercel dashboard

**MongoDB connection fails?**
- Whitelist 0.0.0.0/0 in MongoDB Atlas
- Verify connection string format

**Need help?**
- See full guide: `DEPLOYMENT.md`
- Check Vercel logs: `vercel logs`

## Local Development (Still Works!)

```bash
# Terminal 1: Frontend
npm run dev

# Terminal 2: Backend
node server.cjs
```

---

**Ready to deploy?** Run `.\deploy.ps1` or follow Method 1 above! 🎉
