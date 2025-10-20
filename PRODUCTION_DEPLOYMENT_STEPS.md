# Production Deployment Steps

## ✅ Completed

1. **Created Centralized API Client**: `frontend/src/api/client.ts`
2. **Updated All API Calls**: Replaced direct axios/fetch calls with centralized client
3. **Build Test Passed**: `npm run build` successful
4. **Committed & Pushed**: Changes are in the main branch

## 📋 Next Steps for Production

### 1. Deploy Backend (Already on Render)

Your backend is already deployed at:
```
https://home-history-project.onrender.com
```

**Verify it's running:**
```bash
curl https://home-history-project.onrender.com/api/properties
```

### 2. Configure Frontend Hosting

Choose one of these platforms and follow their setup:

#### Option A: Vercel (Recommended for React)

1. **Connect Repository**:
   - Go to https://vercel.com
   - Import your GitHub repository
   - Select `frontend` as the root directory

2. **Configure Build Settings**:
   - Build Command: `npm run build`
   - Output Directory: `build`
   - Install Command: `npm install`

3. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://home-history-project.onrender.com
   REACT_APP_GOOGLE_MAPS_API_KEY=<your-production-key>
   ```

4. **Deploy**: Click "Deploy"

#### Option B: Netlify

1. **Connect Repository**:
   - Go to https://netlify.com
   - New site from Git
   - Select your repository

2. **Configure Build Settings**:
   - Base directory: `frontend`
   - Build command: `npm run build`
   - Publish directory: `frontend/build`

3. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://home-history-project.onrender.com
   REACT_APP_GOOGLE_MAPS_API_KEY=<your-production-key>
   ```

4. **Deploy**: Click "Deploy site"

#### Option C: Render (Same as backend)

1. **Create Static Site**:
   - Go to https://render.com
   - New Static Site
   - Connect your repository

2. **Configure Build Settings**:
   - Build Command: `cd frontend && npm install && npm run build`
   - Publish Directory: `frontend/build`

3. **Set Environment Variables**:
   ```
   REACT_APP_API_URL=https://home-history-project.onrender.com
   REACT_APP_GOOGLE_MAPS_API_KEY=<your-production-key>
   ```

4. **Deploy**: Create Static Site

### 3. Update Backend CORS

Make sure your backend allows requests from your frontend domain.

**File: `backend/server.ts`**

```typescript
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',           // Local development
    'https://your-app.vercel.app',     // Production frontend (update with your actual domain)
  ],
  credentials: true
}));
```

**Redeploy backend after updating CORS.**

### 4. Test Production Deployment

Once deployed, test these key features:

1. **Search for Location**: Try the "Where did you grow up?" search
2. **View Properties**: Click on map markers
3. **Add Memory**: Submit a new memory with photo
4. **Check API Calls**: Open browser DevTools → Network tab
   - Verify requests go to `https://home-history-project.onrender.com`
   - Check for CORS errors (should be none)

### 5. Monitor for Issues

Common issues and solutions:

#### Issue: 404 on API Calls
**Solution**: Verify `REACT_APP_API_URL` is set correctly in hosting platform

#### Issue: CORS Error
**Solution**: Update backend CORS configuration to include your frontend domain

#### Issue: Google Maps Not Loading
**Solution**: Verify `REACT_APP_GOOGLE_MAPS_API_KEY` is set correctly

#### Issue: Photos Not Uploading
**Solution**: Check Cloudinary credentials in backend `.env`

## 🔍 Verification Commands

### Check Environment Variables (Frontend)
```bash
# During build, CRA will show what env vars it's using
npm run build
```

### Test Backend API (Production)
```bash
# Get all properties
curl https://home-history-project.onrender.com/api/properties

# Test nearby properties
curl -X POST https://home-history-project.onrender.com/api/properties/nearby \
  -H "Content-Type: application/json" \
  -d '{"lat": 40.7128, "lng": -74.0060, "radius": 1}'
```

### Check Frontend API Base URL (Browser Console)
```javascript
// In browser console on your deployed site
console.log(process.env.REACT_APP_API_URL)
// Should show: https://home-history-project.onrender.com
```

## 📝 Environment Variables Summary

### Local Development (.env)
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_MAPS_API_KEY=your_dev_key
```

### Production (Hosting Platform)
```bash
REACT_APP_API_URL=https://home-history-project.onrender.com
REACT_APP_GOOGLE_MAPS_API_KEY=your_production_key
```

### Backend (.env)
```bash
MONGODB_URI=your_mongodb_connection_string
PORT=3001
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 🎉 Success Criteria

Your deployment is successful when:

- [x] Frontend builds without errors
- [ ] Frontend deployed to hosting platform
- [ ] Environment variables configured
- [ ] Can search for locations
- [ ] Can view properties on map
- [ ] Can add memories with photos
- [ ] No CORS errors in browser console
- [ ] API calls reach backend successfully

## 🚀 Quick Deploy Commands

```bash
# 1. Ensure all changes are committed
git status

# 2. Build frontend locally to verify
cd frontend
npm run build

# 3. Deploy to Vercel (if using Vercel CLI)
npx vercel --prod

# 4. Or deploy via Vercel/Netlify dashboard
# Just push to main branch and it will auto-deploy
```

## 📚 Additional Resources

- [Create React App Deployment](https://create-react-app.dev/docs/deployment/)
- [Vercel Documentation](https://vercel.com/docs)
- [Netlify Documentation](https://docs.netlify.com)
- [Render Documentation](https://render.com/docs)

Your frontend is now ready for production deployment! 🎊
