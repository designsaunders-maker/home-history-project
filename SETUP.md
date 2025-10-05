# Home History Project - Search-First Interface

## Overview

This project has been refactored with a search-first interface featuring:

1. **Search-first UI** - Prominent Google Places autocomplete search bar with "Where did you grow up?" prompt
2. **Interactive Maps** - Maps centered on searched locations with nearby property markers
3. **Property Discovery** - Shows nearby homes and their history information
4. **Enhanced Backend** - RESTful API with MongoDB for property management

## Key Features

### Search Interface
- Google Places autocomplete for address search
- Country-restricted to US addresses
- Real-time search suggestions with formatted addresses

### Map Features
- Centered on searched locations
- Red marker for searched location
- Blue markers for nearby properties (within 1-mile radius)
- Info windows showing property details
- Counter showing number of homes found

### User Flow
1. User lands on search-first homepage
2. Searches for an address using Google Places autocomplete
3. Map centers on location and shows nearby properties
4. User can claim a location (requires authentication)
5. Dashboard has tabs for search and property management

## Setup Instructions

### Backend Setup

1. Install dependencies:
```bash
cd backend
npm install
```

2. Set up MongoDB:
   - Install MongoDB locally or use MongoDB Atlas
   - Update connection string in `server.ts` if needed

3. Install environment variables (optional):
```bash
# Create .env file in backend directory
MONGODB_URI=mongodb://localhost/home-history
PORT=3001
```

4. Start the backend:
```bash
npm start
```

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Configure Google Maps API:
   - Get a Google Maps API key from Google Cloud Console
   - Enable Places API and Maps JavaScript API
   - Create a `.env.local` file:
```bash
REACT_APP_API_URL=http://localhost:3001
REACT_APP_GOOGLE_MAPS_API_KEY=your_api_key_here
```

3. Start the frontend:
```bash
npm start
```

## API Endpoints

### Properties
- `GET /api/properties` - Get all properties
- `POST /api/properties` - Create a property
- `GET /api/properties/:id` - Get a specific property
- `PUT /api/properties/:id` - Update a property
- `DELETE /api/properties/:id` - Delete a property
- `POST /api/properties/nearby` - Find properties near a location

### Authentication (existing)
- `POST /api/auth/login`
- `POST /api/auth/register`

## Frontend Components

### New Components
- `SearchBar.tsx` - Google Places autocomplete search bar
- `SearchFirstInterface.tsx` - Main search-first interface with map
- `Dashboard.tsx` - Enhanced dashboard with tabs

### Updated Components
- `OnboardingFlow.tsx` - Simplified to use new search interface
- `App.tsx` - Cleaner routing structure

## Property Model

```typescript
interface PropertyData {
  _id: string;
  address: string;
  yearBuilt: number;
  currentOwner: string;
  lat?: number;
  lng?: number;
}
```

## Routes

- `/` - Search-first homepage with onboarding flow
- `/dashboard` - Enhanced dashboard (requires authentication)
- `/login` - Login page
- `/register` - Registration page

## Key Improvements

1. **User Experience**: Search-first approach with prominent search bar
2. **Better Discovery**: Google Places autocomplete and interactive maps
3. **Visual Clarity**: Map-centered view with clear property markers
4. **Seamless Flow**: Smooth transition from search to property management
5. **Enhanced Backend**: Proper API endpoints for property management

## Development Notes

- Uses Google Maps JavaScript API with Places library
- Requires Google Maps API key with Places API enabled
- Backend supports basic geo-spatial filtering (can be enhanced with MongoDB's geo-spatial features)
- All existing authentication and property claim functionality preserved
