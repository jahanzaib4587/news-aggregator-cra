import { Article, EnhancedSearchFilters } from '../../types';

export interface ApiProvider {
  readonly name: string;
  readonly id: string;
  
  isConfigured(): boolean;
  fetchArticles(filters: EnhancedSearchFilters, signal?: AbortSignal, page?: number): Promise<Article[]>;
  normalizeArticle(article: any): Article;
  supportsFeature(feature: 'categories' | 'authors' | 'dateRange' | 'fullTextSearch'): boolean;
}

export interface ApiProviderConfig {
  baseUrl: string;
  apiKey: string;
  endpoints: Record<string, string>;
}

export abstract class BaseApiProvider implements ApiProvider {
  protected config: ApiProviderConfig;
  
  constructor(config: ApiProviderConfig) {
    this.config = config;
  }
  
  abstract readonly name: string;
  abstract readonly id: string;
  
  isConfigured(): boolean {
    return Boolean(this.config.apiKey) && 
           this.config.apiKey !== `demo_key_${this.id}` && 
           this.config.apiKey.trim() !== '';
  }
  
  abstract fetchArticles(filters: EnhancedSearchFilters, signal?: AbortSignal, page?: number): Promise<Article[]>;
  abstract normalizeArticle(article: any): Article;
  abstract supportsFeature(feature: 'categories' | 'authors' | 'dateRange' | 'fullTextSearch'): boolean;
  
  protected getDefaultImage(): string {
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop&crop=entropy&auto=format&q=80';
  }
} 