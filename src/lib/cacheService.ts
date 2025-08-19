// Cache service for storing Google API search results
// This provides fast access to previously searched data

interface CacheEntry {
  data: any;
  timestamp: number;
  expiresAt: number;
  searchCount: number;
}

interface CacheStats {
  totalEntries: number;
  totalHits: number;
  totalMisses: number;
  hitRate: number;
  memoryUsage: number;
}

export class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private stats = {
    hits: 0,
    misses: 0,
    totalRequests: 0
  };
  private readonly DEFAULT_TTL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
  private readonly MAX_CACHE_SIZE = 1000; // Maximum number of cache entries

  /**
   * Generate cache key from search parameters
   */
  private generateKey(query: string, location: string, category?: string): string {
    const normalizedQuery = query.toLowerCase().trim();
    const normalizedLocation = location.toLowerCase().trim();
    const normalizedCategory = category ? category.toLowerCase().trim() : '';
    
    return `${normalizedQuery}|${normalizedLocation}|${normalizedCategory}`;
  }

  /**
   * Get data from cache
   */
  get(query: string, location: string, category?: string): any | null {
    const key = this.generateKey(query, location, category);
    const entry = this.cache.get(key);

    if (!entry) {
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }

    // Check if entry has expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      this.stats.misses++;
      this.stats.totalRequests++;
      return null;
    }

    // Update access statistics
    entry.searchCount++;
    entry.timestamp = Date.now();
    this.stats.hits++;
    this.stats.totalRequests++;

    return entry.data;
  }

  /**
   * Store data in cache
   */
  set(query: string, location: string, data: any, category?: string, ttl?: number): void {
    const key = this.generateKey(query, location, category);
    const now = Date.now();
    const expiresAt = now + (ttl || this.DEFAULT_TTL);

    // Check cache size limit
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      this.evictOldestEntries();
    }

    const entry: CacheEntry = {
      data,
      timestamp: now,
      expiresAt,
      searchCount: 1
    };

    this.cache.set(key, entry);
  }

  /**
   * Check if data exists in cache
   */
  has(query: string, location: string, category?: string): boolean {
    const key = this.generateKey(query, location, category);
    const entry = this.cache.get(key);

    if (!entry) {
      return false;
    }

    // Check if expired
    if (Date.now() > entry.expiresAt) {
      this.cache.delete(key);
      return false;
    }

    return true;
  }

  /**
   * Remove specific entry from cache
   */
  delete(query: string, location: string, category?: string): boolean {
    const key = this.generateKey(query, location, category);
    return this.cache.delete(key);
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.cache.clear();
    this.resetStats();
  }

  /**
   * Get cache statistics
   */
  getStats(): CacheStats {
    const totalEntries = this.cache.size;
    const totalHits = this.stats.hits;
    const totalMisses = this.stats.misses;
    const totalRequests = this.stats.totalRequests;
    const hitRate = totalRequests > 0 ? (totalHits / totalRequests) * 100 : 0;

    // Estimate memory usage (rough calculation)
    const memoryUsage = this.estimateMemoryUsage();

    return {
      totalEntries,
      totalHits,
      totalMisses,
      hitRate: Math.round(hitRate * 100) / 100,
      memoryUsage
    };
  }

  /**
   * Get popular search terms (most accessed)
   */
  getPopularSearches(limit: number = 10): Array<{ query: string; location: string; category?: string; count: number }> {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => {
        const [query, location, category] = key.split('|');
        return { query, location, category: category || undefined, count: entry.searchCount };
      })
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);

    return entries;
  }

  /**
   * Evict oldest and least used entries when cache is full
   */
  private evictOldestEntries(): void {
    const entries = Array.from(this.cache.entries())
      .map(([key, entry]) => ({ key, entry }))
      .sort((a, b) => {
        // Sort by access count first, then by timestamp
        if (a.entry.searchCount !== b.entry.searchCount) {
          return a.entry.searchCount - b.entry.searchCount;
        }
        return a.entry.timestamp - b.entry.timestamp;
      });

    // Remove bottom 20% of entries
    const entriesToRemove = Math.ceil(entries.length * 0.2);
    for (let i = 0; i < entriesToRemove; i++) {
      this.cache.delete(entries[i].key);
    }
  }

  /**
   * Estimate memory usage of cache
   */
  private estimateMemoryUsage(): number {
    let totalSize = 0;
    
    for (const [key, entry] of this.cache) {
      // Rough estimation: key length + data size + overhead
      totalSize += key.length * 2; // UTF-16 characters
      totalSize += JSON.stringify(entry.data).length * 2;
      totalSize += 100; // Overhead for object structure
    }

    return totalSize;
  }

  /**
   * Reset cache statistics
   */
  private resetStats(): void {
    this.stats = {
      hits: 0,
      misses: 0,
      totalRequests: 0
    };
  }

  /**
   * Clean up expired entries
   */
  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiresAt) {
        this.cache.delete(key);
      }
    }
  }

  /**
   * Get cache size
   */
  size(): number {
    return this.cache.size;
  }

  /**
   * Check if cache is empty
   */
  isEmpty(): boolean {
    return this.cache.size === 0;
  }
}

// Export singleton instance
export const cacheService = new CacheService();

// Clean up expired entries every hour
setInterval(() => {
  cacheService.cleanup();
}, 60 * 60 * 1000);
