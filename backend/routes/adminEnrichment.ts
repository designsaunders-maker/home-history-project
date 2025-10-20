import express, { Request, Response } from 'express';
import pLimit from 'p-limit';
import Property from '../models/property';
import { enrichAddressNormalized, isEnrichmentStale } from '../services/enrichmentService';

const router = express.Router();

/**
 * POST /api/admin/enrich/backfill
 * 
 * Backfills enrichment data for existing properties
 * Query params:
 *   - limit: number (default: 100) - max properties to process
 * 
 * Returns: { processed, updated, skipped, errors }
 */
router.post('/backfill', async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    
    console.log(`[AdminEnrichment] Starting backfill with limit: ${limit}`);
    
    // Find properties missing enrichment or with stale enrichment
    const properties = await Property.find({
      $or: [
        { enrichment: { $exists: false } },
        { 'enrichment.enrichedAt': { $exists: false } },
        { 'enrichment.enrichedAt': { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } }
      ]
    }).limit(limit);
    
    console.log(`[AdminEnrichment] Found ${properties.length} properties to enrich`);
    
    // Use p-limit to control concurrency (5 at a time)
    const limiter = pLimit(5);
    const stats = {
      processed: 0,
      updated: 0,
      skipped: 0,
      errors: 0
    };
    
    // Process properties with concurrency control
    const tasks = properties.map(property => 
      limiter(async () => {
        try {
          stats.processed++;
          
          // Check if enrichment is needed
          if (!isEnrichmentStale(property.enrichment?.enrichedAt)) {
            stats.skipped++;
            console.log(`[AdminEnrichment] Skipping property ${property._id} (enrichment fresh)`);
            return;
          }
          
          console.log(`[AdminEnrichment] Enriching property ${property._id}: ${property.address}`);
          
          // Enrich the address
          const enrichment = await enrichAddressNormalized(property.address);
          property.enrichment = enrichment;
          await property.save();
          
          stats.updated++;
          console.log(`[AdminEnrichment] Updated property ${property._id}`);
          
          // Small delay to respect rate limits (1 req/sec for Nominatim)
          await new Promise(resolve => setTimeout(resolve, 1100));
          
        } catch (error: any) {
          stats.errors++;
          console.error(`[AdminEnrichment] Error processing property ${property._id}:`, error.message);
        }
      })
    );
    
    // Wait for all tasks to complete
    await Promise.all(tasks);
    
    console.log(`[AdminEnrichment] Backfill complete:`, stats);
    
    res.json({
      success: true,
      message: 'Backfill complete',
      stats
    });
    
  } catch (error: any) {
    console.error('[AdminEnrichment] Backfill error:', error);
    res.status(500).json({
      success: false,
      message: 'Backfill failed',
      error: error.message
    });
  }
});

/**
 * GET /api/admin/enrich/stats
 * 
 * Returns statistics about property enrichment status
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const total = await Property.countDocuments();
    const enriched = await Property.countDocuments({ 'enrichment.enrichedAt': { $exists: true } });
    const stale = await Property.countDocuments({
      'enrichment.enrichedAt': { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
    });
    const missing = total - enriched;
    
    res.json({
      success: true,
      stats: {
        total,
        enriched,
        missing,
        stale,
        fresh: enriched - stale
      }
    });
  } catch (error: any) {
    console.error('[AdminEnrichment] Stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get stats',
      error: error.message
    });
  }
});

export default router;

