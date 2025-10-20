import axios from 'axios';

export interface EnrichedAddressData {
  matchedAddress?: string;
  city?: string;
  state?: string;
  zip?: string;
  lat?: number;
  lon?: number;
  source: string;
  enrichedAt: Date;
}

/**
 * Enriches an address by querying Census Geocoder and OpenStreetMap Nominatim APIs
 * Returns normalized fields ready to be stored on Property.enrichment
 */
export async function enrichAddressNormalized(address: string): Promise<EnrichedAddressData> {
  try {
    console.log(`[EnrichmentService] Enriching address: ${address}`);

    // Call both APIs in parallel
    const [censusResponse, nominatimResponse] = await Promise.allSettled([
      // Census Geocoder API
      axios.get('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress', {
        params: {
          address,
          benchmark: '2020',
          format: 'json'
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'HomeHistoryApp/1.0'
        }
      }),
      // OpenStreetMap Nominatim API
      axios.get('https://nominatim.openstreetmap.org/search', {
        params: {
          q: address,
          format: 'json',
          limit: 1
        },
        timeout: 10000,
        headers: {
          'User-Agent': 'HomeHistoryApp/1.0'
        }
      })
    ]);

    // Extract Census data
    let matchedAddress: string | undefined;
    let city: string | undefined;
    let state: string | undefined;
    let zip: string | undefined;

    if (censusResponse.status === 'fulfilled') {
      const censusData = censusResponse.value.data;
      const addressMatch = censusData?.result?.addressMatches?.[0];
      
      if (addressMatch) {
        matchedAddress = addressMatch.matchedAddress;
        const ac = addressMatch.addressComponents;
        if (ac) {
          city = ac.city;
          state = ac.state;
          zip = ac.zip;
        }
      }
    }

    // Extract Nominatim data
    let lat: number | undefined;
    let lon: number | undefined;

    if (nominatimResponse.status === 'fulfilled') {
      const nominatimData = nominatimResponse.value.data;
      if (nominatimData && nominatimData.length > 0) {
        const first = nominatimData[0];
        lat = first.lat ? parseFloat(first.lat) : undefined;
        lon = first.lon ? parseFloat(first.lon) : undefined;
      }
    }

    const enrichedData: EnrichedAddressData = {
      matchedAddress,
      city,
      state,
      zip,
      lat,
      lon,
      source: 'census+osm',
      enrichedAt: new Date()
    };

    console.log(`[EnrichmentService] Enrichment complete:`, enrichedData);
    return enrichedData;

  } catch (error: any) {
    console.error(`[EnrichmentService] Error enriching address:`, error.message);
    
    // Return minimal data with timestamp to avoid re-trying immediately
    return {
      source: 'census+osm',
      enrichedAt: new Date()
    };
  }
}

/**
 * Checks if enrichment data is stale (older than 30 days)
 */
export function isEnrichmentStale(enrichedAt?: Date): boolean {
  if (!enrichedAt) return true;
  
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return enrichedAt < thirtyDaysAgo;
}

