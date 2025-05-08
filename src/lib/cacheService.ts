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
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache miss for key: ${key}`);
      }
      return null;
    }
    
    const now = Date.now();
    if (now - item.timestamp > item.expiresIn) {
      // Cache expired
      if (process.env.NODE_ENV === 'development') {
        console.log(`Cache expired for key: ${key}`);
      }
      this.cache.delete(key);
      return null;
    }
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cache hit for key: ${key}`);
    }
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
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Cached data for key: ${key}, expires in ${expiresIn/1000}s`);
    }
  }
  
  /**
   * Remove an item from the cache
   * @param key The cache key to remove
   */
  remove(key: string): void {
    this.cache.delete(key);
    
    if (process.env.NODE_ENV === 'development') {
      console.log(`Removed cache for key: ${key}`);
    }
  }
  
  /**
   * Clear all items from the cache
   */
  clear(): void {
    this.cache.clear();
    
    if (process.env.NODE_ENV === 'development') {
      console.log('Cache cleared');
    }
  }
}

// Export a singleton instance
export const cacheService = new CacheService(); 