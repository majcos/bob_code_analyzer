/**
 * In-memory cache for Gemini API responses
 * Reduces API calls and credit consumption
 */

interface CacheEntry {
  data: any;
  timestamp: number;
  repoUrl: string;
}

// In-memory cache (will persist during server runtime)
const analysisCache = new Map<string, CacheEntry>();

// Cache duration from environment or default to 1 hour
const CACHE_DURATION_MS = parseInt(process.env.CACHE_DURATION_MS || '3600000', 10);

/**
 * Generate cache key from repository URL
 */
function getCacheKey(repoUrl: string): string {
  // Normalize URL to handle different formats
  const normalized = repoUrl
    .toLowerCase()
    .replace(/^https?:\/\/(www\.)?github\.com\//, '')
    .replace(/\.git$/, '')
    .replace(/\/$/, '');
  return `analysis:${normalized}`;
}

/**
 * Get cached analysis if available and not expired
 */
export function getCachedAnalysis(repoUrl: string): any | null {
  const key = getCacheKey(repoUrl);
  const entry = analysisCache.get(key);

  if (!entry) {
    console.log('[Cache] Miss - no cached data for:', repoUrl);
    return null;
  }

  const age = Date.now() - entry.timestamp;
  if (age > CACHE_DURATION_MS) {
    console.log('[Cache] Expired - removing stale data for:', repoUrl);
    analysisCache.delete(key);
    return null;
  }

  console.log('[Cache] Hit - returning cached data for:', repoUrl, `(age: ${Math.round(age / 1000)}s)`);
  return entry.data;
}

/**
 * Store analysis in cache
 */
export function setCachedAnalysis(repoUrl: string, data: any): void {
  const key = getCacheKey(repoUrl);
  analysisCache.set(key, {
    data,
    timestamp: Date.now(),
    repoUrl,
  });
  console.log('[Cache] Stored analysis for:', repoUrl);
}

/**
 * Clear cache for a specific repository
 */
export function clearCacheForRepo(repoUrl: string): void {
  const key = getCacheKey(repoUrl);
  analysisCache.delete(key);
  console.log('[Cache] Cleared cache for:', repoUrl);
}

/**
 * Clear all cache entries
 */
export function clearAllCache(): void {
  analysisCache.clear();
  console.log('[Cache] Cleared all cache entries');
}

/**
 * Get cache statistics
 */
export function getCacheStats() {
  return {
    size: analysisCache.size,
    entries: Array.from(analysisCache.entries()).map(([key, entry]) => ({
      key,
      repoUrl: entry.repoUrl,
      age: Math.round((Date.now() - entry.timestamp) / 1000),
    })),
  };
}

// Made with Bob
