import React from 'react';
import { GoogleMap, useJsApiLoader, MarkerF } from '@react-google-maps/api';

interface PropertyData {
  _id: string;
  address: string;
  yearBuilt: number;
  currentOwner: string;
  lat?: number;
  lng?: number;
}

interface PropertyMapProps {
  properties: PropertyData[];
  selectedProperty: PropertyData | null;
  onPropertySelect: (property: PropertyData) => void;
}

const defaultCenter = { lat: 40.7128, lng: -74.0060 }; // NYC

const PropertyMap: React.FC<PropertyMapProps> = ({ 
  properties, 
  selectedProperty,
  onPropertySelect 
}) => {
  const { isLoaded } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: process.env.REACT_APP_GOOGLE_MAPS_API_KEY!,
    version: 'weekly'
  });

  if (!isLoaded) return <div>Loading map...</div>;

  return (
    <GoogleMap
      mapContainerStyle={{
        width: '100%',
        height: '100%'
      }}
      center={selectedProperty ? 
        { lat: selectedProperty.lat || defaultCenter.lat, lng: selectedProperty.lng || defaultCenter.lng } : 
        defaultCenter
      }
      zoom={14}
    >
      {properties.map(property => 
        property.lat && property.lng ? (
          <MarkerF
            key={property._id}
            position={{ lat: property.lat, lng: property.lng }}
            onClick={() => onPropertySelect(property)}
          />
        ) : null
      )}
    </GoogleMap>
  );
};

export default PropertyMap;