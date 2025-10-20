# Address Enrichment API

## Overview

The `/api/enrich-address` endpoint enriches addresses with geographic and demographic data from multiple sources:
- **Census Geocoder API**: Official US Census Bureau geocoding data
- **OpenStreetMap Nominatim**: Global geocoding and location data

Results are cached in both memory and MongoDB for improved performance.

## Endpoints

### 1. Enrich Address

**GET** `/api/enrich-address`

Enriches an address with data from Census Geocoder and OpenStreetMap Nominatim APIs.

#### Query Parameters

| Parameter | Type   | Required | Description           |
|-----------|--------|----------|-----------------------|
| address   | string | Yes      | Full address to enrich |

#### Example Request

```bash
GET /api/enrich-address?address=1600%20Pennsylvania%20Avenue%20NW,%20Washington,%20DC%2020500
```

#### Example Response

```json
{
  "success": true,
  "cached": false,
  "data": {
    "address": "1600 Pennsylvania Avenue NW, Washington, DC 20500",
    "census": {
      "result": {
        "input": {
          "address": {
            "address": "1600 Pennsylvania Avenue NW, Washington, DC 20500"
          },
          "benchmark": {
            "isDefault": false,
            "benchmarkDescription": "Public Address Ranges - Census 2020 Benchmark",
            "id": "2020",
            "benchmarkName": "Public_AR_Census2020"
          }
        },
        "addressMatches": [
          {
            "tigerLine": {
              "side": "L",
              "tigerLineId": "76355984"
            },
            "coordinates": {
              "x": -77.03654,
              "y": 38.897676
            },
            "addressComponents": {
              "zip": "20500",
              "streetName": "PENNSYLVANIA",
              "preType": "",
              "city": "WASHINGTON",
              "preDirection": "",
              "suffixDirection": "NW",
              "fromAddress": "1600",
              "state": "DC",
              "suffixType": "AVE",
              "toAddress": "1698",
              "suffixQualifier": "",
              "preQualifier": ""
            },
            "matchedAddress": "1600 PENNSYLVANIA AVE NW, WASHINGTON, DC, 20500"
          }
        ]
      }
    },
    "geocode": [
      {
        "place_id": 139817770,
        "licence": "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
        "osm_type": "way",
        "osm_id": 238241022,
        "boundingbox": ["38.8974908", "38.8977419", "-77.0368537", "-77.0362519"],
        "lat": "38.8976763",
        "lon": "-77.0365298",
        "display_name": "White House, 1600, Pennsylvania Avenue Northwest, Ward 2, Washington, District of Columbia, 20500, United States",
        "class": "tourism",
        "type": "attraction",
        "importance": 0.9010812736758202
      }
    ]
  }
}
```

#### Response Fields

- `success` (boolean): Whether the request was successful
- `cached` (boolean): Whether the response came from cache
- `data.address` (string): The input address
- `data.census` (object): Census Geocoder API response
- `data.geocode` (object): OpenStreetMap Nominatim API response

### 2. Clear Cache

**DELETE** `/api/enrich-address/cache`

Clears both memory and database cache for address enrichment data.

#### Example Request

```bash
DELETE /api/enrich-address/cache
```

#### Example Response

```json
{
  "success": true,
  "message": "Cache cleared",
  "deletedCount": 42
}
```

### 3. Cache Statistics

**GET** `/api/enrich-address/cache/stats`

Returns statistics about the address enrichment cache.

#### Example Request

```bash
GET /api/enrich-address/cache/stats
```

#### Example Response

```json
{
  "success": true,
  "stats": {
    "database": {
      "totalEntries": 42
    },
    "memory": {
      "totalEntries": 15,
      "freshEntries": 12,
      "staleEntries": 3,
      "ttl": 86400000
    }
  }
}
```

## Caching Strategy

### Two-Level Cache

1. **Memory Cache (Primary)**
   - In-memory Map for fastest access
   - TTL: 24 hours
   - Lost on server restart

2. **Database Cache (Secondary)**
   - MongoDB collection for persistence
   - Survives server restarts
   - Shared across instances

### Cache Lookup Order

1. Check memory cache (fastest)
2. If miss, check database cache
3. If miss, fetch from external APIs
4. Store in both caches

### Cache Key

Addresses are normalized for cache lookup:
- Converted to lowercase
- Trimmed of whitespace
- Example: `"1600 Pennsylvania Ave NW"` → `"1600 pennsylvania ave nw"`

## Error Handling

### API Failures

If one or both external APIs fail, the endpoint will still return a response with error information:

```json
{
  "success": true,
  "cached": false,
  "data": {
    "address": "123 Main St",
    "census": {
      "error": "Census API request failed",
      "details": "timeout of 10000ms exceeded"
    },
    "geocode": {
      "error": "Nominatim API request failed",
      "details": "Request failed with status code 503"
    }
  }
}
```

### Validation Errors

```json
{
  "success": false,
  "message": "Address query parameter is required"
}
```

## Rate Limiting

### External APIs

Both external APIs have rate limits:

**Census Geocoder**:
- No official rate limit documented
- Recommended: Be respectful, use caching

**OpenStreetMap Nominatim**:
- Official usage policy: https://operations.osmfoundation.org/policies/nominatim/
- Limit: 1 request per second
- Requires User-Agent header (implemented)
- Heavy use requires setting up your own instance

### Caching Benefits

The built-in caching significantly reduces API calls:
- First request: Hits external APIs
- Subsequent requests (24h): Served from cache
- Reduces load on external services
- Improves response time (< 50ms vs 1-2s)

## Usage Examples

### Using curl

```bash
# Enrich an address
curl "http://localhost:3001/api/enrich-address?address=1600%20Pennsylvania%20Avenue%20NW,%20Washington,%20DC%2020500"

# Get cache statistics
curl "http://localhost:3001/api/enrich-address/cache/stats"

# Clear cache
curl -X DELETE "http://localhost:3001/api/enrich-address/cache"
```

### Using JavaScript (Frontend)

```javascript
import api from '../api/client';

// Enrich an address
const enrichAddress = async (address) => {
  try {
    const response = await api.get('/api/enrich-address', {
      params: { address }
    });
    
    if (response.data.success) {
      const { census, geocode } = response.data.data;
      
      // Extract coordinates from Census
      const censusCoords = census.result?.addressMatches?.[0]?.coordinates;
      
      // Extract coordinates from Nominatim
      const nominatimCoords = geocode[0];
      
      console.log('Census coords:', censusCoords);
      console.log('Nominatim coords:', nominatimCoords);
      
      return response.data.data;
    }
  } catch (error) {
    console.error('Failed to enrich address:', error);
    throw error;
  }
};

// Usage
const data = await enrichAddress('123 Main St, New York, NY 10001');
```

## Data Structure

### Census Geocoder Response

```typescript
interface CensusResponse {
  result: {
    input: {
      address: { address: string };
      benchmark: {
        isDefault: boolean;
        benchmarkDescription: string;
        id: string;
        benchmarkName: string;
      };
    };
    addressMatches: Array<{
      tigerLine: {
        side: string;
        tigerLineId: string;
      };
      coordinates: {
        x: number; // longitude
        y: number; // latitude
      };
      addressComponents: {
        zip: string;
        streetName: string;
        preType: string;
        city: string;
        preDirection: string;
        suffixDirection: string;
        fromAddress: string;
        state: string;
        suffixType: string;
        toAddress: string;
        suffixQualifier: string;
        preQualifier: string;
      };
      matchedAddress: string;
    }>;
  };
}
```

### Nominatim Response

```typescript
interface NominatimResponse extends Array<{
  place_id: number;
  licence: string;
  osm_type: string;
  osm_id: number;
  boundingbox: [string, string, string, string];
  lat: string;
  lon: string;
  display_name: string;
  class: string;
  type: string;
  importance: number;
}> {}
```

## Database Schema

### AddressCache Collection

```typescript
{
  _id: ObjectId;
  address: string;              // Original input address
  normalizedAddress: string;    // Normalized for lookup (lowercase, trimmed)
  censusData: any;              // Census Geocoder response
  geocodeData: any;             // Nominatim response
  createdAt: Date;              // First cached
  updatedAt: Date;              // Last updated
}
```

**Indexes**:
- `normalizedAddress`: Unique index for fast lookups

## Performance

### Benchmarks

| Scenario           | Response Time | API Calls |
|--------------------|---------------|-----------|
| Cache Hit (Memory) | ~5-20ms      | 0         |
| Cache Hit (DB)     | ~50-100ms    | 0         |
| Cache Miss         | ~1-2s        | 2         |

### Optimization Tips

1. **Pre-warm cache**: Enrich addresses before users need them
2. **Batch processing**: Process multiple addresses during off-peak hours
3. **Monitor cache hit rate**: Check `/cache/stats` regularly
4. **Adjust TTL**: Modify `CACHE_TTL` in `enrichAddress.ts` if needed

## Security Considerations

1. **User-Agent Required**: Both APIs require proper User-Agent headers (implemented)
2. **Rate Limiting**: Consider implementing rate limiting on this endpoint
3. **Input Validation**: Addresses are validated for presence and type
4. **Error Handling**: External API failures don't crash the endpoint
5. **Timeout Protection**: 10-second timeout on external API calls

## Future Enhancements

- [ ] Add Redis for distributed caching
- [ ] Implement request rate limiting
- [ ] Add more geocoding services (Google Maps, Mapbox)
- [ ] Support bulk address enrichment
- [ ] Add webhook support for async processing
- [ ] Implement cache warming strategies
- [ ] Add monitoring/metrics (response times, hit rates)

## Troubleshooting

### Issue: All requests are cache misses

**Solution**: Check that addresses are formatted consistently. The cache key is case-insensitive and whitespace-trimmed, but variations in punctuation or abbreviations will result in different cache keys.

### Issue: External API timeouts

**Solution**: The default timeout is 10 seconds. If you're experiencing frequent timeouts, consider:
- Increasing the timeout value
- Implementing retry logic
- Using only one API source

### Issue: High memory usage

**Solution**: The memory cache is unbounded. Consider:
- Implementing LRU (Least Recently Used) eviction
- Reducing cache TTL
- Relying more on database cache

## Support

For issues or questions:
- Check MongoDB connection is working
- Verify axios is installed
- Check server logs for detailed error messages
- Test external APIs directly to verify they're accessible
