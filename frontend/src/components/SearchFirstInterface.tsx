import React, { useState, useEffect } from 'react';
import { MapPin, Home } from 'lucide-react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';
import api from '../api/client';
import SearchBar from './SearchBar';
import PropertyDetail from './PropertyDetail';
import PropertyClaimModal from './property/PropertyClaimModal';

interface SearchResult {
  place_id: string;
  description: string;
  formatted_address: string;
  geometry: {
    location: {
      lat(): number;
      lng(): number;
    };
  };
}

interface PropertyData {
  _id: string;
  address: string;
  yearBuilt?: number;
  lat: number;
  lng: number;
  memories: Array<{
    _id?: string;
    photo?: string;
    memory: string;
    submitterName: string;
    contact?: string;
    residency?: {
      yearMovedIn?: number;
      yearMovedOut?: number;
      current: boolean;
    };
    submittedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

interface SearchFirstInterfaceProps {
  onPropertySelect?: (property: PropertyData) => void;
  showClaimButton?: boolean;
  onClaimLocation?: (address: string, location: { lat: number; lng: number }) => void;
}

const libraries: ("places" | "geometry")[] = ["places"];

const SearchFirstInterface: React.FC<SearchFirstInterfaceProps> = ({
  onPropertySelect,
  showClaimButton = true,
  onClaimLocation
}) => {
  const [selectedPlace, setSelectedPlace] = useState<SearchResult | null>(null);
  const [properties, setProperties] = useState<PropertyData[]>([]);
  const [selectedProperty, setSelectedProperty] = useState<PropertyData | null>(null);
  const [loadingProperties, setLoadingProperties] = useState(false);
  const [nearbyProperties, setNearbyProperties] = useState<PropertyData[]>([]);
  const [showPropertyDetail, setShowPropertyDetail] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);

  // Debug selectedProperty changes
  useEffect(() => {
    console.log('Selected property changed:', selectedProperty);
  }, [selectedProperty]);

  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
    libraries: libraries,
    mapIds: ['home-history-map']
  });

  const fetchNearbyProperties = async (center: { lat: number; lng: number }) => {
    setLoadingProperties(true);
    try {
      // Using the new nearby endpoint
      const response = await api.post('/api/properties/nearby', {
        lat: center.lat,
        lng: center.lng,
        radius: 1 // 1 mile radius
      });
      
      setNearbyProperties(response.data);
      console.log('Nearby properties fetched:', response.data);
    } catch (error) {
      console.error('Error fetching nearby properties:', error);
      // Fallback to client-side filtering if backend endpoint fails
      try {
        const response = await api.get('/api/properties');
        const allProperties = response.data;
        
        const filteredProperties = allProperties.filter((property: PropertyData) => {
          const distance = calculateDistance(
            center.lat, center.lng,
            property.lat, property.lng
          );
          
          return distance <= 1; // 1 mile radius
        });
        
        setNearbyProperties(filteredProperties);
      } catch (fallbackError) {
        console.error('Fallback fetch also failed:', fallbackError);
        setNearbyProperties([]);
      }
    } finally {
      setLoadingProperties(false);
    }
  };

  const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 3959; // Earth's radius in miles
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const handlePlaceSelect = (place: SearchResult) => {
    setSelectedPlace(place);
    const location = {
      lat: place.geometry.location.lat(),
      lng: place.geometry.location.lng()
    };
    fetchNearbyProperties(location);
  };

  const handlePropertyClick = (property: PropertyData) => {
    console.log('Property clicked:', property);
    setSelectedProperty(property);
    setShowPropertyDetail(true);
    onPropertySelect && onPropertySelect(property);
  };

  const handleAddMemory = () => {
    console.log('handleAddMemory called');
    console.log('Current state - showPropertyDetail:', showPropertyDetail, 'showClaimModal:', showClaimModal);
    // Close PropertyDetail modal first
    setShowPropertyDetail(false);
    // Then open ClaimModal
    setShowClaimModal(true);
    console.log('After state change - PropertyDetail should close, ClaimModal should open');
  };

  const handleClaimSubmit = async (claimType: 'basic' | 'enhanced', data: any) => {
    try {
      console.log('Memory submitted:', { claimType, data });
      setShowClaimModal(false);
      // Refresh nearby properties to show the new memory
      if (selectedPlace) {
        const location = {
          lat: selectedPlace.geometry.location.lat(),
          lng: selectedPlace.geometry.location.lng()
        };
        fetchNearbyProperties(location);
      }
      // If we came from PropertyDetail, reopen it to show the new memory
      if (selectedProperty) {
        setShowPropertyDetail(true);
      }
    } catch (error) {
      console.error('Failed to submit memory:', error);
      throw error;
    }
  };

  const handleClaimClick = () => {
    if (selectedPlace && onClaimLocation) {
      const location = {
        lat: selectedPlace.geometry.location.lat(),
        lng: selectedPlace.geometry.location.lng()
      };
      onClaimLocation(selectedPlace.formatted_address, location);
    }
  };

  const mapCenter = selectedPlace ? 
    { lat: selectedPlace.geometry.location.lat(), lng: selectedPlace.geometry.location.lng() } :
    { lat: 40.7128, lng: -74.0060 }; // Default to NYC

  if (!isLoaded) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="ml-3 text-gray-600">Loading Google Maps...</span>
      </div>
    );
  }

  return (
    <div className="w-full h-full flex flex-col">
      {/* Search Bar */}
      <div className="p-6 bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto">
          <SearchBar 
            onPlaceSelect={handlePlaceSelect}
            placeholder="Where did you grow up?"
            className="max-w-2xl mx-auto"
          />
          {selectedPlace && (
            <div className="mt-4 text-center text-gray-600">
              <MapPin className="inline w-4 h-4 mr-1" />
              {selectedPlace.formatted_address}
            </div>
          )}
        </div>
      </div>

      {/* Map Container */}
      <div className="flex-1 relative">
        <GoogleMap
          mapContainerStyle={{ width: '100%', height: '100%' }}
          center={mapCenter}
          zoom={selectedPlace ? 14 : 10}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
            mapTypeControl: false,
            streetViewControl: true,
            fullscreenControl: true,
            mapId: 'home-history-map'
          }}
        >
          {/* Display nearby properties as markers */}
          {nearbyProperties.map((property) => (
            <React.Fragment key={property._id}>
              <MarkerF
                position={{ lat: property.lat, lng: property.lng }}
                onClick={() => handlePropertyClick(property)}
                icon={{
                  path: google.maps.SymbolPath.CIRCLE,
                  scale: 8,
                  fillColor: '#3B82F6',
                  fillOpacity: 1,
                  strokeColor: '#FFFFFF',
                  strokeWeight: 2
                }}
              />
            </React.Fragment>
          ))}

          {/* Mark the searched location */}
          {selectedPlace && (
            <MarkerF
              position={{ lat: selectedPlace.geometry.location.lat(), lng: selectedPlace.geometry.location.lng() }}
              icon={{
                path: google.maps.SymbolPath.CIRCLE,
                scale: 12,
                fillColor: '#EF4444',
                fillOpacity: 1,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
              }}
            />
          )}
        </GoogleMap>

        {/* Loading overlay */}
        {loadingProperties && (
          <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500 mr-2"></div>
            <span className="text-sm text-gray-600">Finding nearby homes...</span>
          </div>
        )}

        {/* Claim button */}
        {showClaimButton && selectedPlace && (
          <div className="absolute top-4 left-4">
            <button
              onClick={handleClaimClick}
              className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-700 transition-colors"
            >
              <Home className="w-5 h-5" />
              Claim This Location
            </button>
          </div>
        )}

        {/* Properties counter */}
        {nearbyProperties.length > 0 && (
          <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3">
            <div className="flex items-center gap-2">
              <Home className="w-4 h-4 text-gray-600" />
              <span className="text-sm font-medium text-gray-900">
                {nearbyProperties.length} home{nearbyProperties.length !== 1 ? 's' : ''} found
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Property Detail Modal */}
      {showPropertyDetail && selectedProperty && (
        <PropertyDetail
          property={selectedProperty}
          onClose={() => {
            setShowPropertyDetail(false);
            setSelectedProperty(null);
          }}
          onAddMemory={handleAddMemory}
        />
      )}

      {/* Claim Modal */}
      {showClaimModal && (
        <PropertyClaimModal
          address={selectedProperty ? selectedProperty.address : selectedPlace?.formatted_address || ''}
          location={{
            lat: selectedProperty ? selectedProperty.lat : selectedPlace?.geometry.location.lat() || 0,
            lng: selectedProperty ? selectedProperty.lng : selectedPlace?.geometry.location.lng() || 0
          }}
          onClose={() => {
            setShowClaimModal(false);
            // If we came from PropertyDetail, reopen it
            if (selectedProperty) {
              setShowPropertyDetail(true);
            }
          }}
          onSubmit={handleClaimSubmit}
          existingProperty={selectedProperty}
        />
      )}
    </div>
  );
};

export default SearchFirstInterface;
