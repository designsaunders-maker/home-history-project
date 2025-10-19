# Photo Upload Setup Guide

## Overview

Photo upload functionality has been added using Cloudinary for image storage and management. Users can now upload photos when sharing their memories about properties.

## Setup Instructions

### 1. Cloudinary Account Setup

1. **Create Cloudinary Account**: Go to [cloudinary.com](https://cloudinary.com) and sign up
2. **Get API Credentials**: From your Cloudinary dashboard, copy:
   - Cloud Name
   - API Key
   - API Secret

### 2. Backend Environment Configuration

Create a `.env` file in the `backend` directory with your Cloudinary credentials:

```bash
# MongoDB
MONGODB_URI=mongodb://localhost/home-history
PORT=3001

# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

### 3. Install Dependencies

The following packages have been installed in the backend:

```bash
cd backend
npm install cloudinary multer @types/multer
```

### 4. Frontend Environment Configuration

Update your frontend `.env.local` file to include the API URL:

```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

## Features Implemented

### Backend Features

1. **Photo Upload Endpoint** (`POST /api/upload`):
   - Accepts multipart/form-data with photo file
   - Validates file type (images only)
   - 5MB file size limit
   - Uploads to Cloudinary with optimization
   - Returns secure URL and public ID

2. **Updated Property Model**:
   - Added `photo` field to store Cloudinary URL
   - Updated all CRUD operations to handle photo field

3. **Image Optimization**:
   - Automatic resizing (max 800x600)
   - Quality optimization
   - Organized in 'home-history-photos' folder

### Frontend Features

1. **Enhanced PropertyClaimModal**:
   - Photo file input with preview
   - Upload progress indicator
   - Error handling for upload failures
   - Photo preview after successful upload

2. **Updated SearchFirstInterface**:
   - Displays photos in map info windows
   - Responsive image sizing
   - Fallback for properties without photos

3. **Type Safety**:
   - Updated TypeScript interfaces
   - Proper error handling
   - Loading states

## API Endpoints

### Upload Photo
```
POST /api/upload
Content-Type: multipart/form-data

Body: { photo: File }
Response: { success: true, photoUrl: string, publicId: string }
```

### Create Property (Updated)
```
POST /api/properties
Content-Type: application/json

Body: {
  address: string,
  yearBuilt: number,
  currentOwner: string,
  lat: number,
  lng: number,
  memory?: string,
  contact?: string,
  photo?: string,  // NEW: Cloudinary URL
  residency?: {
    startDate: string,
    endDate?: string,
    current: boolean
  }
}
```

## User Flow

1. **User searches for location** using Google Places autocomplete
2. **Clicks "Claim This Location"** button
3. **Fills out memory form** including:
   - Name and email
   - Residency dates
   - Memory text
   - **Photo upload** (optional)
4. **Photo upload process**:
   - User selects image file
   - Photo uploads to Cloudinary
   - Preview shows uploaded image
   - URL stored with property data
5. **Memory saved** to MongoDB with photo URL
6. **Other users can view** the memory and photo in map info windows

## File Structure

```
backend/
├── config/
│   └── cloudinary.ts          # Cloudinary configuration
├── routes/
│   └── upload.ts              # Photo upload endpoint
├── models/
│   └── property.ts            # Updated with photo field
└── .env                       # Cloudinary credentials

frontend/
├── src/
│   ├── components/
│   │   ├── property/
│   │   │   └── PropertyClaimModal.tsx  # Enhanced with photo upload
│   │   └── SearchFirstInterface.tsx    # Displays photos in info windows
│   └── types/
│       └── property.ts        # Updated interface
```

## Security Features

- **File Type Validation**: Only image files allowed
- **File Size Limit**: 5MB maximum
- **Secure URLs**: Cloudinary provides HTTPS URLs
- **Input Sanitization**: Proper error handling and validation

## Error Handling

- **Upload Failures**: Clear error messages for users
- **Network Issues**: Graceful fallback handling
- **Invalid Files**: Type and size validation
- **Cloudinary Errors**: Proper error logging and user feedback

## Testing

To test the photo upload functionality:

1. **Start Backend**: `cd backend && npm start`
2. **Start Frontend**: `cd frontend && npm start`
3. **Search for location** and click "Claim This Location"
4. **Upload a photo** in the memory form
5. **Verify photo appears** in map info windows

## Troubleshooting

### Common Issues

1. **"Cloudinary not configured" error**:
   - Check `.env` file has correct credentials
   - Restart backend server after adding credentials

2. **"Upload failed" error**:
   - Check file size (must be under 5MB)
   - Check file type (must be image)
   - Verify Cloudinary credentials are correct

3. **Photos not displaying**:
   - Check browser console for CORS errors
   - Verify photo URLs are being saved correctly
   - Check Cloudinary account has proper permissions

### Debug Mode

The backend includes debug logging for photo uploads. Check the console for:
- Received property data
- Cloudinary upload responses
- Error details

## Production Considerations

1. **Environment Variables**: Use secure environment variable management
2. **CORS Configuration**: Update CORS settings for production domains
3. **Rate Limiting**: Consider adding rate limiting for uploads
4. **Image Optimization**: Cloudinary handles this automatically
5. **CDN**: Cloudinary provides global CDN for fast image delivery

## Cost Considerations

- **Cloudinary Free Tier**: 25GB storage, 25GB bandwidth/month
- **Additional Storage**: Pay-as-you-go pricing
- **Bandwidth**: Included in free tier for most use cases

The photo upload functionality is now fully integrated and ready for use!

