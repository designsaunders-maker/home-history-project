import express, { Request, Response } from 'express';
import axios from 'axios';
import AddressCache from '../models/AddressCache';

const router = express.Router();

// In-memory cache as a fallback (lightweight map)
const memoryCache = new Map<string, {
  address: string;
  census: any;
  geocode: any;
  timestamp: number;
}>();

const CACHE_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * GET /api/enrich-address
 * Query params: address=<string>
 * 
 * Enriches an address with data from Census Geocoder and OpenStreetMap Nominatim
 */
router.get('/', async (req: Request, res: Response) => {
  try {
    const { address } = req.query;

    if (!address || typeof address !== 'string') {
      return res.status(400).json({ 
        success: false,
        message: 'Address query parameter is required' 
      });
    }

    const normalizedAddress = address.toLowerCase().trim();

    // Check memory cache first
    const memCached = memoryCache.get(normalizedAddress);
    if (memCached && (Date.now() - memCached.timestamp < CACHE_TTL)) {
      console.log(`[AddressEnrich] Memory cache hit for: ${address}`);
      return res.json({
        success: true,
        cached: true,
        data: {
          address: memCached.address,
          census: memCached.census,
          geocode: memCached.geocode
        }
      });
    }

    // Check database cache
    try {
      const dbCached = await AddressCache.findOne({ normalizedAddress });
      if (dbCached) {
        console.log(`[AddressEnrich] DB cache hit for: ${address}`);
        
        // Update memory cache
        memoryCache.set(normalizedAddress, {
          address: dbCached.address,
          census: dbCached.censusData,
          geocode: dbCached.geocodeData,
          timestamp: Date.now()
        });

        return res.json({
          success: true,
          cached: true,
          data: {
            address: dbCached.address,
            census: dbCached.censusData,
            geocode: dbCached.geocodeData
          }
        });
      }
    } catch (dbError) {
      console.error('[AddressEnrich] DB cache lookup error:', dbError);
      // Continue to fetch from APIs if DB fails
    }

    // Fetch from external APIs
    console.log(`[AddressEnrich] Cache miss, fetching from APIs for: ${address}`);

    const [censusResponse, geocodeResponse] = await Promise.allSettled([
      // Census Geocoder API
      axios.get('https://geocoding.geo.census.gov/geocoder/locations/onelineaddress', {
        params: {
          address,
          benchmark: '2020',
          format: 'json'
        },
        timeout: 10000, // 10 second timeout
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
        timeout: 10000, // 10 second timeout
        headers: {
          'User-Agent': 'HomeHistoryApp/1.0'
        }
      })
    ]);

    // Extract data or errors
    const censusData = censusResponse.status === 'fulfilled' 
      ? censusResponse.value.data 
      : { error: 'Census API request failed', details: censusResponse.reason?.message };

    const geocodeData = geocodeResponse.status === 'fulfilled' 
      ? geocodeResponse.value.data 
      : { error: 'Nominatim API request failed', details: geocodeResponse.reason?.message };

    const enrichedData = {
      address,
      census: censusData,
      geocode: geocodeData
    };

    // Store in memory cache
    memoryCache.set(normalizedAddress, {
      address,
      census: censusData,
      geocode: geocodeData,
      timestamp: Date.now()
    });

    // Store in database cache (async, don't wait)
    AddressCache.create({
      address,
      normalizedAddress,
      censusData,
      geocodeData
    }).catch(err => {
      console.error('[AddressEnrich] Failed to save to DB cache:', err);
    });

    res.json({
      success: true,
      cached: false,
      data: enrichedData
    });

  } catch (error: any) {
    console.error('[AddressEnrich] Error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Failed to enrich address',
      error: error.message 
    });
  }
});

/**
 * DELETE /api/enrich-address/cache
 * Clear the address enrichment cache (for admin/testing)
 */
router.delete('/cache', async (req: Request, res: Response) => {
  try {
    // Clear memory cache
    memoryCache.clear();

    // Clear database cache
    const result = await AddressCache.deleteMany({});

    res.json({
      success: true,
      message: 'Cache cleared',
      deletedCount: result.deletedCount
    });
  } catch (error: any) {
    console.error('[AddressEnrich] Error clearing cache:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to clear cache',
      error: error.message
    });
  }
});

/**
 * GET /api/enrich-address/cache/stats
 * Get cache statistics (for admin/monitoring)
 */
router.get('/cache/stats', async (req: Request, res: Response) => {
  try {
    const dbCount = await AddressCache.countDocuments();
    const memoryCount = memoryCache.size;

    // Calculate memory cache age distribution
    const now = Date.now();
    let freshCount = 0;
    let staleCount = 0;

    memoryCache.forEach((entry) => {
      if (now - entry.timestamp < CACHE_TTL) {
        freshCount++;
      } else {
        staleCount++;
      }
    });

    res.json({
      success: true,
      stats: {
        database: {
          totalEntries: dbCount
        },
        memory: {
          totalEntries: memoryCount,
          freshEntries: freshCount,
          staleEntries: staleCount,
          ttl: CACHE_TTL
        }
      }
    });
  } catch (error: any) {
    console.error('[AddressEnrich] Error getting cache stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get cache stats',
      error: error.message
    });
  }
});

export default router;

