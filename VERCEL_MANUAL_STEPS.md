# Vercel Deployment - Manual Steps

Since the Vercel CLI requires interactive authentication, follow these manual steps:

## Step 1: Login to Vercel

```bash
vercel login
```

- Press ENTER when prompted
- Your browser will open
- Authenticate with your Vercel account
- Return to terminal when complete

## Step 2: Link Project

```bash
cd /Users/DSaunders/Desktop/home-history-project/frontend
vercel link
```

When prompted:
- **Set up and deploy?** → Yes
- **Which scope?** → Select your account/team
- **Link to existing project?** → No (or Yes if you already created one)
- **What's your project's name?** → `home-history-project`
- **In which directory is your code located?** → `./` (current directory)

## Step 3: Add Environment Variables

### Method A: Using CLI (Recommended)

```bash
# Navigate to frontend directory
cd /Users/DSaunders/Desktop/home-history-project/frontend

# Add Google Maps API Key
echo "AIzaSyCFpFTLO_Tvr9V8x-OjfRJtkCPz6K-w7EI" | vercel env add REACT_APP_GOOGLE_MAPS_API_KEY production

# Add Backend API URL
echo "https://home-history-project.onrender.com" | vercel env add REACT_APP_API_URL production
```

### Method B: Using Vercel Dashboard (Alternative)

1. Go to https://vercel.com/dashboard
2. Select your `home-history-project`
3. Go to **Settings** → **Environment Variables**
4. Add the following variables:

| Name | Value | Environment |
|------|-------|-------------|
| `REACT_APP_GOOGLE_MAPS_API_KEY` | `AIzaSyCFpFTLO_Tvr9V8x-OjfRJtkCPz6K-w7EI` | Production |
| `REACT_APP_API_URL` | `https://home-history-project.onrender.com` | Production |

5. Click **Save**

## Step 4: Configure Build Settings

In Vercel dashboard → Settings → General:

| Setting | Value |
|---------|-------|
| Framework Preset | Create React App |
| Root Directory | `frontend` |
| Build Command | `npm run build` |
| Output Directory | `build` |
| Install Command | `npm install` |

## Step 5: Deploy

```bash
cd /Users/DSaunders/Desktop/home-history-project/frontend
vercel --prod
```

Or push to your main branch - Vercel will auto-deploy if connected to GitHub.

## Step 6: Verify Deployment

After deployment completes:

1. **Check Environment Variables**:
   ```bash
   vercel env ls
   ```

2. **Visit Your Site**:
   - Vercel will provide a URL (e.g., `https://home-history-project.vercel.app`)
   - Test the map functionality
   - Open DevTools → Network tab
   - Verify API calls go to `https://home-history-project.onrender.com`

3. **Check for Errors**:
   - Open browser console
   - Look for any Google Maps API errors
   - Check for CORS errors

## Troubleshooting

### Issue: "vercel: command not found"

**Solution**:
```bash
npm i -g vercel
# Restart terminal if needed
```

### Issue: Authentication error during login

**Solution**:
- Clear browser cache
- Try incognito/private window
- Use: `vercel login --github` or `vercel login --gitlab`

### Issue: Environment variables not working

**Solution**:
1. Verify variables are added: `vercel env ls`
2. Redeploy: `vercel --prod`
3. Check Vercel dashboard → Settings → Environment Variables

### Issue: Map not loading on deployed site

**Solution**:
1. Check browser console for API key errors
2. Verify `REACT_APP_GOOGLE_MAPS_API_KEY` is set in Vercel
3. Restrict API key to your Vercel domain in Google Cloud Console:
   - Add: `https://home-history-project.vercel.app/*`
   - Add: `https://*.vercel.app/*` (for preview deployments)

### Issue: API calls failing (404 errors)

**Solution**:
1. Verify `REACT_APP_API_URL` is set to `https://home-history-project.onrender.com`
2. Check backend CORS allows your Vercel domain
3. Verify backend is running on Render

## Quick Reference Commands

```bash
# Login
vercel login

# Link project
cd frontend && vercel link

# Add env var (interactive)
vercel env add REACT_APP_GOOGLE_MAPS_API_KEY production

# List env vars
vercel env ls

# Deploy to production
vercel --prod

# Deploy preview
vercel

# View logs
vercel logs

# Open project in browser
vercel open
```

## Alternative: Automated Script

I've created a script to automate some of these steps:

```bash
# Make it executable (already done)
chmod +x VERCEL_DEPLOYMENT_SCRIPT.sh

# Run it
./VERCEL_DEPLOYMENT_SCRIPT.sh
```

The script will:
1. Check/install Vercel CLI
2. Prompt you to login
3. Link the project
4. Add environment variables
5. Optionally deploy to production

## Important Security Notes

1. ✅ Never commit `.env` files
2. ✅ Delete the old exposed API key in Google Cloud Console
3. ✅ Restrict your new API key to specific domains
4. ✅ Set up billing alerts in Google Cloud
5. ✅ Monitor API usage regularly

## Support

If you encounter issues:
- Check Vercel documentation: https://vercel.com/docs
- Review build logs in Vercel dashboard
- Check the `GOOGLE_MAPS_API_KEY_SETUP.md` guide
- Verify all environment variables are set correctly

Good luck with your deployment! 🚀
