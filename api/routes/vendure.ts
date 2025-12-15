/**
 * Vendure Proxy Routes
 *
 * Proxy endpoints for Vendure API to avoid CORS issues.
 * Includes simple in-memory caching for better performance.
 */

import { Router, Request, Response } from 'express'
import { vendureService, type VendureFacet } from '../services/vendureService'

const router = Router()

// Simple in-memory cache
interface CacheEntry {
  data: any
  timestamp: number
}

const cache = new Map<string, CacheEntry>()
const CACHE_TTL = 5 * 60 * 1000 // 5 minutes in milliseconds

/**
 * Get cached data if available and not expired
 */
function getFromCache(key: string): any | null {
  const entry = cache.get(key)
  if (!entry) return null

  const now = Date.now()
  if (now - entry.timestamp > CACHE_TTL) {
    cache.delete(key)
    return null
  }

  return entry.data
}

/**
 * Save data to cache
 */
function saveToCache(key: string, data: any): void {
  cache.set(key, {
    data,
    timestamp: Date.now(),
  })
}

/**
 * GET /api/vendure/facets
 * Get all facets from Vendure API
 */
router.get('/facets', async (req: Request, res: Response) => {
  try {
    console.log('[Vendure Proxy] Received request for facets')

    // Check cache first
    const cacheKey = 'facets'
    const cachedData = getFromCache(cacheKey)

    if (cachedData) {
      console.log('[Vendure Proxy] Returning cached facets')
      return res.json({
        data: cachedData,
        cached: true,
      })
    }

    // Fetch from Vendure API
    console.log('[Vendure Proxy] Fetching from Vendure API...')
    const facets = await vendureService.getFacets()

    // Save to cache
    saveToCache(cacheKey, facets)

    console.log('[Vendure Proxy] Successfully fetched and cached', facets.length, 'facets')

    res.json({
      data: facets,
      cached: false,
    })
  } catch (error) {
    console.error('[Vendure Proxy] Error fetching facets:', error)

    res.status(500).json({
      error: 'internal_server_error',
      reason: 'vendure_api_error',
      message: error instanceof Error ? error.message : 'Failed to fetch facets from Vendure',
    })
  }
})

/**
 * POST /api/vendure/clear-cache
 * Clear the cache (useful for testing/debugging)
 */
router.post('/clear-cache', (req: Request, res: Response) => {
  const size = cache.size
  cache.clear()
  console.log('[Vendure Proxy] Cache cleared,', size, 'entries removed')

  res.json({
    message: 'Cache cleared successfully',
    entriesRemoved: size,
  })
})

/**
 * GET /api/vendure/cache-status
 * Get cache status information
 */
router.get('/cache-status', (req: Request, res: Response) => {
  const entries = Array.from(cache.entries()).map(([key, entry]) => ({
    key,
    age: Math.floor((Date.now() - entry.timestamp) / 1000), // age in seconds
    expiresIn: Math.floor((CACHE_TTL - (Date.now() - entry.timestamp)) / 1000), // remaining TTL in seconds
  }))

  res.json({
    cacheSize: cache.size,
    cacheTTL: CACHE_TTL / 1000, // TTL in seconds
    entries,
  })
})

export default router
