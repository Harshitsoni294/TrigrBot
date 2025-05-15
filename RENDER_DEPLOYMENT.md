# Deploy Backend to Render

This guide shows how to deploy `server.cjs` independently to Render, separate from the Vercel frontend.

## Step 1: Prepare Backend for Render

Your `server.cjs` is already configured correctly:
- ✅ Listens on `process.env.PORT` (Render provides this)
- ✅ Uses environment variables from `.env`
- ✅ Has CORS enabled

## Step 2: Deploy to Render

1. Go to https://render.com/ and sign up/login
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository: `Harshitsoni294/TrigrBot`
4. Configure:
   - **Name**: `trigrbot-api` (or your choice)
   - **Region**: Choose closest to you
   - **Branch**: `main`
   - **Root Directory**: Leave empty (or `.` if required)
   - **Runtime**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `node server.cjs`
   - **Plan**: Free

5. **Add Environment Variables** (click "Advanced" → "Add Environment Variable"):
   ```
   MONGODB_URI=mongodb+srv://harshitsoni2026_db_user:Harshit123@cluster0.nsazufd.mongodb.net/
   GEMINI_API_KEY=AIzaSyD3Wm-P7PLnFsbSMU-0JTYSLmxDNxv7RsA
   PORT=4000
   NODE_ENV=production
   ```

6. Click **"Create Web Service"**

## Step 3: Get Your Backend URL

After deployment completes (5-10 minutes):
- Render will give you a URL like: `https://trigrbot-api.onrender.com`
- Test it: `https://trigrbot-api.onrender.com/ping` (if you add a ping endpoint)

## Step 4: Configure Frontend (Vercel)

1. Go to Vercel dashboard
2. Open your project → **Settings** → **Environment Variables**
3. Add this variable:
   ```
   VITE_API_BASE_URL=https://trigrbot-api.onrender.com
   ```
   - Select: **Production**, **Preview**, **Development**
4. Click **Save**
5. Go to **Deployments** → **Redeploy** latest deployment

## Step 5: Update CORS in server.cjs (Optional)

If you want to restrict CORS to only your Vercel domain, update `server.cjs`:

```javascript
app.use(cors({
  origin: ['https://trigrbot.harshitsoni.me', 'http://localhost:5173'],
  credentials: true
}));
```

## Testing

1. Frontend (Vercel): https://trigrbot.harshitsoni.me/
2. Backend (Render): https://trigrbot-api.onrender.com/

Test flow:
- Open frontend
- Open chatbot
- Try: "generate 10 math questions"
- Should call: `https://trigrbot-api.onrender.com/generate-test`

## Important Notes

⚠️ **Render Free Tier Limitations:**
- Service spins down after 15 minutes of inactivity
- First request after spin-down takes 30-60 seconds (cold start)
- Consider upgrading to paid plan for always-on service

💡 **Alternative: Keep Vercel Serverless Functions**
If cold starts are an issue, you can keep the backend on Vercel (serverless) by reverting these changes and using the `api/*.cjs` files we created earlier.

## Troubleshooting

**Frontend can't reach backend:**
- Check CORS settings in server.cjs
- Verify `VITE_API_BASE_URL` is set in Vercel
- Check Render logs for errors

**MongoDB connection fails:**
- Whitelist `0.0.0.0/0` in MongoDB Atlas Network Access
- Verify `MONGODB_URI` is correct in Render environment variables

**Cold start delays:**
- Normal for Render free tier
- Upgrade to paid plan, or use Vercel serverless (instant)
