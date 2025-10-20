# Google Maps API Key Security Setup

## ⚠️ Security Fix Applied

The exposed Google Maps API key has been removed from the codebase and replaced with environment variable references.

## What Was Changed

### Before (INSECURE ❌):
```html
<!-- frontend/public/index.html -->
<script src="https://maps.googleapis.com/maps/api/js?key=AIzaSyA0yYVcwBZkw5Z3aAmTwh-uyYdrWy0ZSfI&libraries=places"></script>
```

### After (SECURE ✅):
```html
<!-- frontend/public/index.html -->
<script src="https://maps.googleapis.com/maps/api/js?key=%REACT_APP_GOOGLE_MAPS_API_KEY%&libraries=places"></script>
```

## Environment Variable Setup

### Local Development

Create or update `frontend/.env`:

```bash
REACT_APP_GOOGLE_MAPS_API_KEY=your_new_api_key_here
REACT_APP_API_URL=http://localhost:3001
```

**Note**: The `.env` file is already in `.gitignore` and will not be committed to the repository.

### Production Deployment (Vercel)

1. Go to your Vercel project settings
2. Navigate to **Environment Variables**
3. Add the following variables:

```
REACT_APP_GOOGLE_MAPS_API_KEY=your_new_production_api_key
REACT_APP_API_URL=https://home-history-project.onrender.com
```

4. Redeploy your application

### How It Works

**In HTML files** (Create React App):
- Use `%REACT_APP_VARIABLE_NAME%` syntax
- CRA replaces these at build time
- Example: `key=%REACT_APP_GOOGLE_MAPS_API_KEY%`

**In JavaScript/TypeScript**:
- Use `process.env.REACT_APP_VARIABLE_NAME`
- Already implemented in:
  - `frontend/src/components/SearchFirstInterface.tsx`
  - `frontend/src/components/PropertyMap.tsx`

## API Key Best Practices

### 🔒 Security Recommendations

1. **Restrict Your API Key**:
   - Go to [Google Cloud Console](https://console.cloud.google.com/apis/credentials)
   - Select your API key
   - Click "Edit API key"
   - Under "Application restrictions":
     - Choose "HTTP referrers (web sites)"
     - Add your domains:
       - `http://localhost:3000/*` (local dev)
       - `https://home-history-project.vercel.app/*` (production)
       - `https://*.vercel.app/*` (preview deployments)

2. **Limit API Access**:
   - Under "API restrictions", select "Restrict key"
   - Enable only:
     - Maps JavaScript API
     - Places API
     - Geocoding API (if needed)

3. **Set Usage Quotas**:
   - Set daily quotas to prevent abuse
   - Enable billing alerts
   - Monitor usage regularly

4. **Rotate Keys**:
   - Create new keys periodically
   - Delete old/exposed keys immediately
   - Update environment variables

### 🚨 Important: Old Key Exposure

**Action Items**:

1. ✅ **Old key removed** from codebase (commit: 3782a51)
2. ⚠️ **Delete the old key** in Google Cloud Console:
   - Go to [API Credentials](https://console.cloud.google.com/apis/credentials)
   - Find key: `AIzaSyA0yYVcwBZkw5Z3aAmTwh-uyYdrWy0ZSfI`
   - Click the trash icon to delete it
   - This prevents unauthorized usage

3. ✅ **Create new key** (you've done this)
4. 📝 **Add to .env** locally
5. 📝 **Add to Vercel** environment variables

## Environment Variables Reference

### Frontend (.env)

```bash
# Google Maps API Key
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here

# Backend API URL
REACT_APP_API_URL=http://localhost:3001
```

### Backend (.env)

```bash
# MongoDB Connection
MONGODB_URI=your_mongodb_connection_string

# Server Port
PORT=3001

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

## Testing the Setup

### 1. Local Development

```bash
# Create .env file
echo "REACT_APP_GOOGLE_MAPS_API_KEY=your_new_key" > frontend/.env
echo "REACT_APP_API_URL=http://localhost:3001" >> frontend/.env

# Start the app
cd frontend
npm start

# Verify in browser
# Open DevTools → Network tab
# Look for requests to maps.googleapis.com
# The key parameter should be your new key
```

### 2. Check Environment Variables

```bash
# During build, CRA shows which env vars are being used
cd frontend
npm run build | grep REACT_APP
```

### 3. Verify in Browser

Open browser console and run:
```javascript
// Check if Google Maps loaded
console.log(typeof google !== 'undefined' ? 'Maps loaded ✓' : 'Maps failed ✗');

// The API key won't be visible in process.env in the browser
// But you can check the script tag
document.querySelector('script[src*="maps.googleapis.com"]').src
```

## Troubleshooting

### Issue: Map not loading

**Solutions**:
1. Check `.env` file exists in `frontend/` directory
2. Verify `REACT_APP_GOOGLE_MAPS_API_KEY` is set
3. Restart development server after adding `.env`
4. Check browser console for API key errors
5. Verify API key is enabled for Maps JavaScript API

### Issue: "This API key is not authorized"

**Solutions**:
1. Check API key restrictions in Google Cloud Console
2. Add your domain to HTTP referrers
3. Verify the correct APIs are enabled
4. Wait a few minutes for changes to propagate

### Issue: Build shows undefined for API key

**Solution**:
```bash
# Verify .env file format (no quotes needed)
REACT_APP_GOOGLE_MAPS_API_KEY=AIza...
# NOT:
REACT_APP_GOOGLE_MAPS_API_KEY="AIza..."
```

## Deployment Checklist

- [x] Removed exposed API key from codebase
- [x] Updated HTML to use environment variable
- [x] Verified build passes
- [x] Committed and pushed changes
- [ ] Delete old API key in Google Cloud Console
- [ ] Add new API key to local `.env`
- [ ] Add new API key to Vercel environment variables
- [ ] Restrict new API key to your domains
- [ ] Enable only required APIs
- [ ] Set usage quotas
- [ ] Test map functionality locally
- [ ] Test map functionality in production

## Git History Cleanup (Optional)

The old API key is still in git history. To completely remove it:

```bash
# Option 1: Use BFG Repo-Cleaner (recommended)
# Download from: https://rtyley.github.io/bfg-repo-cleaner/
java -jar bfg.jar --replace-text passwords.txt
git reflog expire --expire=now --all
git gc --prune=now --aggressive
git push --force

# Option 2: Use git-filter-repo (modern alternative)
git filter-repo --replace-text <(echo "AIzaSyA0yYVcwBZkw5Z3aAmTwh-uyYdrWy0ZSfI==>REDACTED")
git push --force
```

⚠️ **Warning**: Force pushing rewrites history. Coordinate with your team first.

## Best Practices Going Forward

1. **Never commit secrets** - Use `.env` files (already in `.gitignore`)
2. **Rotate keys regularly** - Update every 90 days
3. **Use key restrictions** - Limit to your domains only
4. **Monitor usage** - Set up billing alerts
5. **Use different keys** - Development vs Production
6. **Document properly** - Keep this guide updated

## Support

If you encounter issues:
- Check `.env` file format and location
- Verify Google Cloud Console settings
- Check browser console for detailed errors
- Review Network tab for failed API requests

The API key is now securely managed via environment variables! 🔒
