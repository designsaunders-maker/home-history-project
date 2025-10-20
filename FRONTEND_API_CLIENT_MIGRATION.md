# Frontend API Client Migration

## Overview

Successfully migrated the frontend to use a centralized API client with environment variable-based configuration for the backend URL. This enables proper communication with the Render backend at `https://home-history-project.onrender.com` in production.

## Changes Made

### 1. Created Centralized API Client

**File: `frontend/src/api/client.ts`**

```typescript
import axios from "axios";

// Extend Window interface for runtime API URL injection
declare global {
  interface Window {
    __API_URL__?: string;
  }
}

const API_BASE_URL =
  process.env.REACT_APP_API_URL ||
  (typeof window !== "undefined" ? window.__API_URL__ : undefined) ||
  "http://localhost:3001";

export const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  withCredentials: false
});

export default api;
```

**Features:**
- Uses `process.env.REACT_APP_API_URL` for environment-based configuration
- Supports runtime injection via `window.__API_URL__` (useful for Docker/Kubernetes)
- Falls back to `http://localhost:3001` for local development
- Centralized axios instance with consistent headers

### 2. Updated All API Calls

**Files Modified:**

1. **`frontend/src/components/SearchFirstInterface.tsx`**
   - Changed: `axios.post(\`${process.env.REACT_APP_API_URL}/api/properties/nearby\`)` → `api.post('/api/properties/nearby')`
   - Changed: `axios.get(\`${process.env.REACT_APP_API_URL}/api/properties\`)` → `api.get('/api/properties')`

2. **`frontend/src/components/property/PropertyClaimModal.tsx`**
   - Changed: `axios.post(\`${process.env.REACT_APP_API_URL}/api/upload\`)` → `api.post('/api/upload')`
   - Changed: `axios.post(\`${process.env.REACT_APP_API_URL}/api/properties/memories\`)` → `api.post('/api/properties/memories')`

3. **`frontend/src/components/AddProperty.tsx`**
   - Changed: `axios.post(\`${process.env.REACT_APP_API_URL}/api/properties\`)` → `api.post('/api/properties')`

4. **`frontend/src/components/EditProperty.tsx`**
   - Changed: `axios.put(\`${process.env.REACT_APP_API_URL}/api/properties/${id}\`)` → `api.put(\`/api/properties/${id}\`)`

5. **`frontend/src/components/PropertyList.tsx`**
   - Changed: `axios.get(\`${process.env.REACT_APP_API_URL}/api/properties\`)` → `api.get('/api/properties')`

6. **`frontend/src/auth/AuthContext.tsx`**
   - Changed: `fetch('/api/auth/register')` → `api.post('/api/auth/register', userData)`
   - Changed: `fetch('/api/auth/login')` → `api.post('/api/auth/login', { email, password })`
   - Updated `authFetch` utility to `authApi` using axios instead of fetch

### 3. Environment Configuration

**Local Development (.env):**
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

**Production (Render/Vercel):**
```bash
REACT_APP_API_URL=https://home-history-project.onrender.com
REACT_APP_GOOGLE_MAPS_API_KEY=your_production_api_key
```

### 4. .gitignore Verification

The `.gitignore` already includes:
```
node_modules/
.env
dist/
build/
frontend/node_modules
frontend/build
backend/node_modules
```

## Benefits

### ✅ Advantages:

1. **Environment Flexibility**: 
   - Easy to switch between local and production backends
   - Configure via environment variables without code changes

2. **Centralized Configuration**:
   - Single source of truth for API baseURL
   - Consistent headers across all requests
   - Easy to add interceptors for auth tokens, logging, etc.

3. **Cleaner Code**:
   - Removed repetitive `${process.env.REACT_APP_API_URL}` from every API call
   - Shorter, more readable API calls: `api.post('/endpoint')`

4. **Production Ready**:
   - Works with Render backend at `https://home-history-project.onrender.com`
   - No more 404 errors from relative paths in production

5. **Runtime Configuration Support**:
   - Can inject API URL at runtime via `window.__API_URL__`
   - Useful for containerized deployments

## Migration Pattern

### Before:
```typescript
import axios from 'axios';

const response = await axios.post(
  `${process.env.REACT_APP_API_URL}/api/properties/nearby`,
  { lat, lng, radius }
);
```

### After:
```typescript
import api from '../api/client';

const response = await api.post(
  '/api/properties/nearby',
  { lat, lng, radius }
);
```

## Testing

### Build Test:
```bash
cd frontend
npm run build
```

**Result**: ✅ Build successful (only warnings for unused variables)

### Local Development:
```bash
# Set environment variable
echo "REACT_APP_API_URL=http://localhost:3001" > frontend/.env

# Start backend
cd backend
npm run dev

# Start frontend
cd frontend
npm start
```

### Production Deployment:
1. Set `REACT_APP_API_URL=https://home-history-project.onrender.com` in your hosting platform (Vercel, Netlify, etc.)
2. Deploy frontend
3. Frontend will automatically use the Render backend

## API Endpoints Summary

All API calls now route through the centralized client to these endpoints:

- `POST /api/properties/nearby` - Find nearby properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create new property
- `PUT /api/properties/:id` - Update property
- `POST /api/properties/memories` - Add memory to property
- `POST /api/upload` - Upload photo to Cloudinary
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

## Future Enhancements

### Potential Additions:

1. **Request/Response Interceptors**:
```typescript
// Add auth token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle 401 errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);
```

2. **Request Logging**:
```typescript
api.interceptors.request.use((config) => {
  console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
  return config;
});
```

3. **Error Handling Utility**:
```typescript
export const handleApiError = (error: any) => {
  if (error.response) {
    // Server responded with error status
    return error.response.data.message || 'Server error';
  } else if (error.request) {
    // Request made but no response
    return 'Network error - please check your connection';
  } else {
    // Error in request setup
    return error.message || 'Unknown error';
  }
};
```

## Deployment Checklist

- [x] Created centralized API client
- [x] Updated all API calls to use client
- [x] Added TypeScript types for window.__API_URL__
- [x] Verified .gitignore includes .env
- [x] Build test passed
- [ ] Set `REACT_APP_API_URL` environment variable in production hosting
- [ ] Deploy frontend
- [ ] Test API calls in production
- [ ] Monitor for CORS issues (may need backend CORS configuration)

## CORS Configuration (Backend)

Make sure your backend (`https://home-history-project.onrender.com`) has CORS configured to allow requests from your frontend domain:

```typescript
// backend/server.ts
import cors from 'cors';

app.use(cors({
  origin: [
    'http://localhost:3000',
    'https://your-frontend-domain.com'
  ],
  credentials: true
}));
```

The migration is complete and ready for production deployment! 🚀
