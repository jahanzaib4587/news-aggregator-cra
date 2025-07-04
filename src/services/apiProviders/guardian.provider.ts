import axios from 'axios';
import { BaseApiProvider } from './apiProvider.interface';
import { Article, EnhancedSearchFilters, GuardianArticle, GuardianApiResponse } from '../../types';

export class GuardianApiProvider extends BaseApiProvider {
  readonly name = 'The Guardian';
  readonly id = 'guardian';

  supportsFeature(feature: 'categories' | 'authors' | 'dateRange' | 'fullTextSearch'): boolean {
    switch (feature) {
      case 'categories': return true;
      case 'authors': return false; // Client-side filtering
      case 'dateRange': return true;
      case 'fullTextSearch': return true;
      default: return false;
    }
  }

  async fetchArticles(filters: EnhancedSearchFilters, signal?: AbortSignal, page?: number): Promise<Article[]> {
    const params: Record<string, string | number> = {
      'api-key': this.config.apiKey,
      'page-size': 50,
      'order-by': 'newest',
      'show-fields': 'trailText,thumbnail,bodyText,byline'
    };

    if (filters.keyword) {
      params.q = filters.keyword;
    }

    if (filters.category && filters.category !== 'all') {
      // Guardian API supports multiple sections with pipe separator
      const categories = filters.category.split(',');
      const guardianSections = categories.map(cat => this.mapCategoryToGuardianSection(cat));
      params.section = guardianSections.join('|');
    }

    if (filters.dateFrom) {
      params['from-date'] = filters.dateFrom;
    }

    if (filters.dateTo) {
      params['to-date'] = filters.dateTo;
    }

    const response = await axios.get<GuardianApiResponse>(
      `${this.config.baseUrl}${this.config.endpoints.search}`,
      { params, signal }
    );

    if (response.data.response.status !== 'ok') {
      throw new Error(`Guardian API error: ${response.data.response.status}`);
    }

    return response.data.response.results.map(article => this.normalizeArticle(article));
  }

  private mapCategoryToGuardianSection(category: string): string {
    const categoryMap: Record<string, string> = {
      'business': 'business',
      'technology': 'technology',
      'science': 'science',
      'health': 'society',
      'sports': 'sport',
      'entertainment': 'culture',
      'general': 'world'
    };
    
    return categoryMap[category] || 'world';
  }

  normalizeArticle(article: GuardianArticle): Article {
    const sectionToCategory: Record<string, string> = {
      'business': 'business',
      'technology': 'technology', 
      'science': 'science',
      'society': 'health',
      'sport': 'sports',
      'culture': 'entertainment',
      'world': 'general',
      'uk-news': 'general',
      'us-news': 'general'
    };

    const sectionName = article.sectionName?.toLowerCase() || 'general';
    const category = sectionToCategory[sectionName] || 'general';

    return {
      id: article.id || `guardian-${Date.now()}-${Math.random()}`,
      title: article.webTitle || 'No Title Available',
      description: article.fields?.trailText || 'No description available',
      content: article.fields?.bodyText || undefined,
      url: article.webUrl || '#',
      urlToImage: article.fields?.thumbnail || this.getDefaultImage(),
      publishedAt: article.webPublicationDate || new Date().toISOString(),
      source: {
        id: 'guardian',
        name: 'The Guardian'
      },
      author: article.fields?.byline || undefined,
      category: category
    };
  }
} 