import React, { useRef, useEffect, useState } from 'react';
import { Search, MapPin } from 'lucide-react';

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

interface SearchBarProps {
  onPlaceSelect: (place: SearchResult) => void;
  placeholder?: string;
  className?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({ 
  onPlaceSelect, 
  placeholder = "Where did you grow up?",
  className = "" 
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [searchValue, setSearchValue] = useState('');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    // Check if Google Maps API is loaded
    if (window.google && window.google.maps && window.google.maps.places) {
      setIsLoaded(true);
      initializeAutocomplete();
    } else {
      // Fallback check for API loading
      const checkGoogleAPI = setInterval(() => {
        if (window.google && window.google.maps && window.google.maps.places) {
          setIsLoaded(true);
          initializeAutocomplete();
          clearInterval(checkGoogleAPI);
        }
      }, 100);

      return () => clearInterval(checkGoogleAPI);
    }
  }, []);

  const initializeAutocomplete = () => {
    if (!inputRef.current || !window.google) return;

    const autocomplete = new window.google.maps.places.Autocomplete(inputRef.current, {
      types: ['address'],
      componentRestrictions: { country: 'us' }, // Limit to US addresses
      fields: ['place_id', 'formatted_address', 'name', 'geometry']
    });

    autocompleteRef.current = autocomplete;

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      
      if (place.geometry && place.geometry.location) {
        const result: SearchResult = {
          place_id: place.place_id || '',
          description: place.name || '',
          formatted_address: place.formatted_address || '',
          geometry: {
            location: {
              lat: () => place.geometry?.location?.lat() || 0,
              lng: () => place.geometry?.location?.lng() || 0
            }
          }
        };
        
        setSearchValue(result.formatted_address);
        onPlaceSelect(result);
      }
    });
  };

  return (
    <div className={`relative w-full ${className}`}>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={searchValue}
          onChange={(e) => setSearchValue(e.target.value)}
          placeholder={placeholder}
          className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
          disabled={false}
        />
        {!isLoaded && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400"></div>
          </div>
        )}
      </div>
      
      {!isLoaded && (
        <p className="mt-2 text-sm text-gray-500 text-center">
          Loading Google Maps...
        </p>
      )}
    </div>
  );
};

export default SearchBar;
