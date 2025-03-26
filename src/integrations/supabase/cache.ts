
import { CACHE_TTL } from './constants';

// Simple cache implementation
export class SimpleCache {
  private cache: Map<string, {data: any, timestamp: number}> = new Map();
  
  get(key: string): any | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    // Check if entry is expired
    if (Date.now() - entry.timestamp > CACHE_TTL) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.data;
  }
  
  set(key: string, data: any): void {
    this.cache.set(key, {
      data,
      timestamp: Date.now()
    });
  }
  
  invalidate(keyPattern: string): void {
    for (const key of this.cache.keys()) {
      if (key.includes(keyPattern)) {
        this.cache.delete(key);
      }
    }
  }
  
  clear(): void {
    this.cache.clear();
  }
}

// Create a global cache instance
export const queryCache = new SimpleCache();
