import type { Article, EnhancedSearchFilters } from '../types';
import { API_CONFIG } from '../config/api';
import { mockArticles } from '../data/mockData';
import cacheService from './cache.service';
import { ApiProvider } from './apiProviders/apiProvider.interface';
import { NewsApiProvider } from './apiProviders/newsApi.provider';
import { GuardianApiProvider } from './apiProviders/guardian.provider';
import { NYTimesApiProvider } from './apiProviders/nyTimes.provider';

class ApiService {
  private providers: Map<string, ApiProvider> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders(): void {
    const newsApiProvider = new NewsApiProvider({
      baseUrl: API_CONFIG.newsApi.baseUrl,
      apiKey: API_CONFIG.newsApi.apiKey,
      endpoints: API_CONFIG.newsApi.endpoints
    });

    const guardianProvider = new GuardianApiProvider({
      baseUrl: API_CONFIG.guardian.baseUrl,
      apiKey: API_CONFIG.guardian.apiKey,
      endpoints: API_CONFIG.guardian.endpoints
    });

    const nyTimesProvider = new NYTimesApiProvider({
      baseUrl: API_CONFIG.nyTimes.baseUrl,
      apiKey: API_CONFIG.nyTimes.apiKey,
      endpoints: API_CONFIG.nyTimes.endpoints
    });

    this.providers.set('newsapi', newsApiProvider);
    this.providers.set('guardian', guardianProvider);
    this.providers.set('nytimes', nyTimesProvider);
  }

  private getProvider(sourceId: string): ApiProvider | undefined {
    return this.providers.get(sourceId);
  }

  private hasConfiguredProviders(): boolean {
    return Array.from(this.providers.values()).some(provider => provider.isConfigured());
  }

  private shouldUseMockData(): boolean {
    return !this.hasConfiguredProviders();
  }

  private filterMockData(filters: EnhancedSearchFilters): Article[] {
    let filtered = [...mockArticles];

    if (filters.keyword) {
      const keyword = filters.keyword.toLowerCase();
      filtered = filtered.filter(article => 
        article.title.toLowerCase().includes(keyword) ||
        article.description.toLowerCase().includes(keyword)
      );
    }

    if (filters.category && filters.category !== 'all') {
      filtered = filtered.filter(article => 
        article.category === filters.category
      );
    }

    if (filters.source && filters.source !== 'all') {
      filtered = filtered.filter(article => 
        article.source.id.includes(filters.source!)
      );
    }
    
    // Sort by newest first (default)
    filtered.sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime());

    // Ensure all articles have images (fallback for mock data)  
    const defaultImage = 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop&crop=entropy&auto=format&q=80';
    return filtered.map(article => ({
      ...article,
      urlToImage: article.urlToImage || defaultImage
    }));
  }

  async fetchArticles(filters: EnhancedSearchFilters, sources: string[], signal?: AbortSignal, page?: number): Promise<Article[]> {
    // Check cache first - but not for empty filters (initial load) or when page is specified
    const isInitialLoad = !filters.keyword && !filters.category && !filters.source && !filters.dateFrom && !filters.dateTo;
    if (!isInitialLoad && !page) {
      const cachedData = cacheService.get(filters, sources);
      if (cachedData) {
        return cachedData;
      }
    }

    // Use mock data if no valid API keys are configured
    if (this.shouldUseMockData()) {
      const mockData = this.filterMockData(filters);
      // Don't cache initial load mock data
      if (!isInitialLoad) {
        cacheService.set(filters, sources, mockData);
      }
      return mockData;
    }

    const promises: Promise<Article[]>[] = [];
    const sourcesToUse = sources.length > 0 ? sources : ['newsapi', 'guardian', 'nytimes'];

    // Fetch from specified sources using strategy pattern
    for (const sourceId of sourcesToUse) {
      const provider = this.getProvider(sourceId);
      if (provider && provider.isConfigured()) {
        // Pass page parameter to provider (only NY Times will use it)
        promises.push(provider.fetchArticles(filters, signal, page));
      }
    }

    if (promises.length === 0) {
      console.warn('No configured API providers available');
      return [];
    }

    const results = await Promise.allSettled(promises);
    const articles: Article[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        articles.push(...result.value);
      } else {
        console.error(`API call ${index + 1} failed:`, result.reason);
      }
    });

    // Remove duplicates based on title and URL
    const uniqueArticles = articles.filter((article, index, self) => 
      index === self.findIndex(a => 
        a.title === article.title || a.url === article.url
      )
    );

    // Default sorting by newest first
    const sortedArticles = uniqueArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Cache the results only if not paginated
    if (!page) {
      cacheService.set(filters, sources, sortedArticles);
    }
    
    return sortedArticles;
  }

  // Utility methods for accessing provider information
  getAvailableProviders(): string[] {
    return Array.from(this.providers.keys());
  }

  getConfiguredProviders(): string[] {
    return Array.from(this.providers.entries())
      .filter(([, provider]) => provider.isConfigured())
      .map(([id]) => id);
  }

  getProviderInfo(sourceId: string): { name: string; id: string; configured: boolean } | null {
    const provider = this.getProvider(sourceId);
    if (!provider) return null;
    
    return {
      name: provider.name,
      id: provider.id,
      configured: provider.isConfigured()
    };
  }
}

export default new ApiService(); 