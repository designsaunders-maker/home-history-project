# Address Enrichment API - Usage Examples

## Quick Start

### Test the Endpoint

```bash
# Using curl
curl "http://localhost:3001/api/enrich-address?address=1600%20Pennsylvania%20Avenue%20NW,%20Washington,%20DC%2020500"
```

### Response Structure

```json
{
  "success": true,
  "cached": false,
  "data": {
    "address": "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    "census": { /* Census Geocoder data */ },
    "geocode": [ /* Nominatim data */ ]
  }
}
```

## Frontend Integration Examples

### Example 1: Enrich Address from Search Bar

```typescript
// In your SearchBar or PropertyClaimModal component
import api from '../api/client';

const enrichAndValidateAddress = async (userInput: string) => {
  try {
    const response = await api.get('/api/enrich-address', {
      params: { address: userInput }
    });

    if (response.data.success) {
      const { census, geocode } = response.data.data;

      // Extract coordinates from Census (more accurate for US addresses)
      const censusMatch = census.result?.addressMatches?.[0];
      const coords = censusMatch ? {
        lat: censusMatch.coordinates.y,
        lng: censusMatch.coordinates.x,
        source: 'census'
      } : null;

      // Fallback to Nominatim if Census has no results
      const nominatimData = geocode[0];
      const fallbackCoords = nominatimData ? {
        lat: parseFloat(nominatimData.lat),
        lng: parseFloat(nominatimData.lon),
        source: 'nominatim'
      } : null;

      const finalCoords = coords || fallbackCoords;

      return {
        address: censusMatch?.matchedAddress || nominatimData?.display_name || userInput,
        coordinates: finalCoords,
        validated: !!censusMatch,
        enrichedData: response.data.data
      };
    }
  } catch (error) {
    console.error('Address enrichment failed:', error);
    return null;
  }
};

// Usage in PropertyClaimModal
const handleAddressSubmit = async () => {
  const enriched = await enrichAndValidateAddress(formData.address);
  
  if (enriched?.coordinates) {
    // Use validated address and coordinates
    await api.post('/api/properties/memories', {
      address: enriched.address,
      lat: enriched.coordinates.lat,
      lng: enriched.coordinates.lng,
      // ... other fields
    });
  } else {
    // Show error: "Could not validate address"
  }
};
```

### Example 2: Auto-complete Address Suggestions

```typescript
// Enhanced SearchBar with address validation
import { useState, useEffect } from 'react';
import api from '../api/client';

const AddressSearchBar = () => {
  const [query, setQuery] = useState('');
  const [enrichedData, setEnrichedData] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  // Debounced enrichment on user input
  useEffect(() => {
    if (query.length < 10) return; // Wait for reasonable input

    const timer = setTimeout(async () => {
      setIsValidating(true);
      try {
        const response = await api.get('/api/enrich-address', {
          params: { address: query }
        });
        
        if (response.data.success) {
          setEnrichedData(response.data.data);
        }
      } catch (error) {
        console.error('Enrichment error:', error);
      } finally {
        setIsValidating(false);
      }
    }, 1000); // 1 second debounce

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div>
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Enter address..."
      />
      
      {isValidating && <span>Validating...</span>}
      
      {enrichedData?.census?.result?.addressMatches?.[0] && (
        <div className="address-suggestion">
          ✓ {enrichedData.census.result.addressMatches[0].matchedAddress}
        </div>
      )}
    </div>
  );
};
```

### Example 3: Property History with Census Data

```typescript
// Enrich property with Census demographic data
const enrichPropertyWithCensusData = async (address: string) => {
  try {
    const response = await api.get('/api/enrich-address', {
      params: { address }
    });

    if (response.data.success) {
      const { census } = response.data.data;
      const match = census.result?.addressMatches?.[0];

      if (match) {
        return {
          coordinates: {
            lat: match.coordinates.y,
            lng: match.coordinates.x
          },
          addressComponents: {
            street: `${match.addressComponents.fromAddress} ${match.addressComponents.streetName}`,
            city: match.addressComponents.city,
            state: match.addressComponents.state,
            zip: match.addressComponents.zip,
            direction: match.addressComponents.suffixDirection
          },
          tigerLineId: match.tigerLine.tigerLineId,
          matchedAddress: match.matchedAddress
        };
      }
    }
    return null;
  } catch (error) {
    console.error('Census enrichment failed:', error);
    return null;
  }
};

// Usage
const propertyData = await enrichPropertyWithCensusData(
  '742 Evergreen Terrace, Springfield, OR 97477'
);
```

### Example 4: Batch Address Enrichment

```typescript
// Enrich multiple addresses (use sparingly, respects rate limits)
const batchEnrichAddresses = async (addresses: string[]) => {
  const results = [];
  
  // Sequential processing to respect rate limits
  for (const address of addresses) {
    try {
      const response = await api.get('/api/enrich-address', {
        params: { address }
      });
      
      if (response.data.success) {
        results.push({
          address,
          data: response.data.data,
          cached: response.data.cached
        });
      }
      
      // Respect Nominatim rate limit (1 req/sec)
      if (!response.data.cached) {
        await new Promise(resolve => setTimeout(resolve, 1100));
      }
    } catch (error) {
      console.error(`Failed to enrich ${address}:`, error);
      results.push({
        address,
        error: true
      });
    }
  }
  
  return results;
};

// Usage
const addresses = [
  '123 Main St, New York, NY 10001',
  '456 Oak Ave, Los Angeles, CA 90001',
  '789 Pine Rd, Chicago, IL 60601'
];

const enrichedResults = await batchEnrichAddresses(addresses);
```

### Example 5: Map Integration with Enriched Coordinates

```typescript
// Use enriched coordinates for map markers
import { GoogleMap, MarkerF } from '@react-google-maps/api';

const EnrichedPropertyMap = ({ address }) => {
  const [coordinates, setCoordinates] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        const response = await api.get('/api/enrich-address', {
          params: { address }
        });

        if (response.data.success) {
          const { census, geocode } = response.data.data;
          
          // Prefer Census coordinates for US addresses
          const censusCoords = census.result?.addressMatches?.[0]?.coordinates;
          if (censusCoords) {
            setCoordinates({
              lat: censusCoords.y,
              lng: censusCoords.x
            });
          } else if (geocode[0]) {
            setCoordinates({
              lat: parseFloat(geocode[0].lat),
              lng: parseFloat(geocode[0].lon)
            });
          }
        }
      } catch (error) {
        console.error('Failed to get coordinates:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchCoordinates();
  }, [address]);

  if (loading) return <div>Loading map...</div>;
  if (!coordinates) return <div>Could not locate address</div>;

  return (
    <GoogleMap
      center={coordinates}
      zoom={15}
      mapContainerStyle={{ width: '100%', height: '400px' }}
    >
      <MarkerF position={coordinates} />
    </GoogleMap>
  );
};
```

### Example 6: Address Validation UI Component

```typescript
// Complete address validation component
import { useState } from 'react';
import { CheckCircle, XCircle, Loader } from 'lucide-react';
import api from '../api/client';

const AddressValidator = ({ address, onValidated }) => {
  const [status, setStatus] = useState<'idle' | 'validating' | 'valid' | 'invalid'>('idle');
  const [validatedAddress, setValidatedAddress] = useState(null);

  const validateAddress = async () => {
    setStatus('validating');
    
    try {
      const response = await api.get('/api/enrich-address', {
        params: { address }
      });

      if (response.data.success) {
        const censusMatch = response.data.data.census.result?.addressMatches?.[0];
        const nominatimMatch = response.data.data.geocode[0];

        if (censusMatch || nominatimMatch) {
          setStatus('valid');
          setValidatedAddress({
            formatted: censusMatch?.matchedAddress || nominatimMatch?.display_name,
            lat: censusMatch?.coordinates.y || parseFloat(nominatimMatch?.lat),
            lng: censusMatch?.coordinates.x || parseFloat(nominatimMatch?.lon),
            source: censusMatch ? 'census' : 'nominatim'
          });
          
          if (onValidated) {
            onValidated(validatedAddress);
          }
        } else {
          setStatus('invalid');
        }
      }
    } catch (error) {
      console.error('Validation error:', error);
      setStatus('invalid');
    }
  };

  return (
    <div className="address-validator">
      <button onClick={validateAddress} disabled={status === 'validating'}>
        Validate Address
      </button>
      
      {status === 'validating' && (
        <div className="flex items-center gap-2">
          <Loader className="animate-spin" />
          <span>Validating...</span>
        </div>
      )}
      
      {status === 'valid' && (
        <div className="flex items-center gap-2 text-green-600">
          <CheckCircle />
          <div>
            <div>✓ Address validated</div>
            <div className="text-sm">{validatedAddress?.formatted}</div>
            <div className="text-xs">
              Coordinates: {validatedAddress?.lat.toFixed(6)}, {validatedAddress?.lng.toFixed(6)}
            </div>
          </div>
        </div>
      )}
      
      {status === 'invalid' && (
        <div className="flex items-center gap-2 text-red-600">
          <XCircle />
          <span>Could not validate address. Please check and try again.</span>
        </div>
      )}
    </div>
  );
};
```

## Admin/Testing Examples

### Check Cache Statistics

```bash
# Get cache statistics
curl http://localhost:3001/api/enrich-address/cache/stats
```

```json
{
  "success": true,
  "stats": {
    "database": {
      "totalEntries": 150
    },
    "memory": {
      "totalEntries": 42,
      "freshEntries": 38,
      "staleEntries": 4,
      "ttl": 86400000
    }
  }
}
```

### Clear Cache

```bash
# Clear all cached addresses
curl -X DELETE http://localhost:3001/api/enrich-address/cache
```

## Testing Examples

### Unit Test Example (Jest)

```typescript
import axios from 'axios';

describe('Address Enrichment API', () => {
  const API_URL = 'http://localhost:3001/api/enrich-address';

  test('should enrich a valid US address', async () => {
    const response = await axios.get(API_URL, {
      params: { address: '1600 Pennsylvania Avenue NW, Washington, DC 20500' }
    });

    expect(response.data.success).toBe(true);
    expect(response.data.data).toHaveProperty('census');
    expect(response.data.data).toHaveProperty('geocode');
    expect(response.data.data.address).toBeTruthy();
  });

  test('should use cache on second request', async () => {
    const address = '123 Main St, New York, NY 10001';
    
    // First request
    const response1 = await axios.get(API_URL, { params: { address } });
    expect(response1.data.cached).toBe(false);

    // Second request (should be cached)
    const response2 = await axios.get(API_URL, { params: { address } });
    expect(response2.data.cached).toBe(true);
  });

  test('should handle missing address parameter', async () => {
    try {
      await axios.get(API_URL);
    } catch (error) {
      expect(error.response.status).toBe(400);
      expect(error.response.data.message).toContain('required');
    }
  });
});
```

## Best Practices

1. **Cache First**: The API uses intelligent caching, so feel free to call it frequently
2. **Debounce User Input**: Wait ~1 second after user stops typing before enriching
3. **Prefer Census for US**: Census data is more accurate for US addresses
4. **Fallback to Nominatim**: Use Nominatim for international addresses or when Census fails
5. **Handle Errors Gracefully**: Both APIs can fail or timeout - always have fallback UI
6. **Respect Rate Limits**: For batch operations, add delays between requests
7. **Monitor Cache Hit Rate**: Use `/cache/stats` to optimize your caching strategy

## Production Considerations

1. **Set Up Monitoring**: Track response times and cache hit rates
2. **Configure Alerts**: Alert on high API failure rates
3. **Scale Horizontally**: Consider Redis for distributed caching
4. **Rate Limiting**: Implement rate limiting on this endpoint
5. **API Keys**: Both APIs are free but have usage policies - read them
6. **Backup Strategy**: Cache in multiple layers for reliability

## Support

For issues or questions about the Address Enrichment API:
- Check the main documentation: `API_ENRICH_ADDRESS.md`
- Review server logs for detailed error messages
- Test external APIs directly to verify accessibility
- Check MongoDB connection status
