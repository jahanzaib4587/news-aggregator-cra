import { Article, SearchFilters, EnhancedSearchFilters } from '../types';

interface CacheEntry {
  data: Article[];
  timestamp: number;
  key: string;
}

class CacheService {
  private cache: Map<string, CacheEntry> = new Map();
  private readonly CACHE_TTL = 5 * 60 * 1000; // 5 minutes
  private readonly MAX_CACHE_SIZE = 50;

  private generateCacheKey(filters: EnhancedSearchFilters, sources: string[]): string {
    return JSON.stringify({
      filters: {
        keyword: filters.keyword || '',
        category: filters.category || '',
        source: filters.source || '',
        dateFrom: filters.dateFrom || '',
        dateTo: filters.dateTo || ''
      },
      sources: sources.sort()
    });
  }

  get(filters: EnhancedSearchFilters, sources: string[]): Article[] | null {
    const key = this.generateCacheKey(filters, sources);
    const entry = this.cache.get(key);

    if (!entry) {
      return null;
    }

    const isExpired = Date.now() - entry.timestamp > this.CACHE_TTL;
    if (isExpired) {
      this.cache.delete(key);
      return null;
    }

    return entry.data;
  }

  set(filters: EnhancedSearchFilters, sources: string[], data: Article[]): void {
    const key = this.generateCacheKey(filters, sources);
    
    if (this.cache.size >= this.MAX_CACHE_SIZE) {
      const oldestKey = Array.from(this.cache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp)[0][0];
      this.cache.delete(oldestKey);
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      key
    });
  }

  clear(): void {
    this.cache.clear();
  }

  invalidate(filters?: EnhancedSearchFilters): void {
    if (!filters) {
      this.clear();
      return;
    }

    const keysToDelete: string[] = [];
    this.cache.forEach((entry, key) => {
      const cacheKey = JSON.parse(key);
      if (cacheKey.filters.category === filters.category ||
          cacheKey.filters.keyword === filters.keyword ||
          cacheKey.filters.source === filters.source) {
        keysToDelete.push(key);
      }
    });

    keysToDelete.forEach(key => this.cache.delete(key));
  }
}

export default new CacheService(); 