/**
 * Simple caching service to avoid redundant API calls
 */

interface CacheItem<T> {
  data: T;
  timestamp: number;
  expiresIn: number; // in milliseconds
}

class CacheService {
  private cache: Map<string, CacheItem<any>> = new Map();
  
  /**
   * Get data from cache if it exists and is not expired
   * @param key The cache key
   * @returns The cached data or null if not found or expired
   */
  get<T>(key: string): T | null {
    const item = this.cache.get(key);
    
    if (!item) {
      // Cache miss
      return null;
    }
    
    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      // Cache expired
      this.cache.delete(key);
      return null;
    }
    
    // Cache hit
    return item.data as T;
  }
  
  /**
   * Set data in the cache
   * @param key The cache key
   * @param data The data to cache
   * @param expiresIn How long to cache the data (in milliseconds), default 5 minutes
   */
  set<T>(key: string, data: T, expiresIn: number = 5 * 60 * 1000): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      expiresIn
    });
  }
  
  /**
   * Remove an item from the cache
   * @param key The cache key to remove
   */
  remove(key: string): void {
    this.cache.delete(key);
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
  }
}

// Export a singleton instance
export const cacheService = new CacheService(); 