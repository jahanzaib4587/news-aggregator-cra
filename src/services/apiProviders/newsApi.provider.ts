import axios from 'axios';
import { BaseApiProvider } from './apiProvider.interface';
import { Article, EnhancedSearchFilters, NewsApiArticle, NewsApiResponse } from '../../types';

export class NewsApiProvider extends BaseApiProvider {
  readonly name = 'NewsAPI';
  readonly id = 'newsapi';

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
      apiKey: this.config.apiKey,
      pageSize: 50,
      language: 'en',
      sortBy: 'publishedAt'
    };

    // Use /everything endpoint for keyword searches, /top-headlines for category/general browsing
    const useEverything = Boolean(filters.keyword) || Boolean(filters.dateFrom) || Boolean(filters.dateTo);
    const endpoint = useEverything 
      ? this.config.endpoints.everything 
      : this.config.endpoints.topHeadlines;

    if (filters.keyword) {
      params.q = filters.keyword;
    }
    
    if (filters.category && filters.category !== 'all') {
      // NewsAPI only supports single category, use first one
      const categories = filters.category.split(',');
      params.category = categories[0];
    }

    if (filters.dateFrom) {
      params.from = filters.dateFrom;
    }

    if (filters.dateTo) {
      params.to = filters.dateTo;
    }

    // For top headlines, add country parameter
    if (!useEverything) {
      params.country = 'us';
    }

    const response = await axios.get<NewsApiResponse>(
      `${this.config.baseUrl}${endpoint}`,
      { params, signal }
    );

    if (response.data.status !== 'ok') {
      throw new Error(`NewsAPI error: ${response.data.status}`);
    }

    return response.data.articles.map(article => this.normalizeArticle(article));
  }

  normalizeArticle(article: NewsApiArticle): Article {
    const determineCategory = (): string => {
      const title = (article.title || '').toLowerCase();
      const description = (article.description || '').toLowerCase();
      const content = title + ' ' + description;

      if (content.includes('business') || content.includes('finance') || content.includes('market') || content.includes('economy')) {
        return 'business';
      } else if (content.includes('tech') || content.includes('digital') || content.includes('software') || content.includes('ai')) {
        return 'technology';
      } else if (content.includes('science') || content.includes('research') || content.includes('study')) {
        return 'science';
      } else if (content.includes('health') || content.includes('medical') || content.includes('medicine')) {
        return 'health';
      } else if (content.includes('sport') || content.includes('football') || content.includes('basketball')) {
        return 'sports';
      } else if (content.includes('entertainment') || content.includes('movie') || content.includes('music')) {
        return 'entertainment';
      }
      
      return 'general';
    };

    return {
      id: article.url || `newsapi-${Date.now()}-${Math.random()}`,
      title: article.title || 'No Title Available',
      description: article.description || 'No description available',
      content: article.content,
      url: article.url || '#',
      urlToImage: article.urlToImage || this.getDefaultImage(),
      publishedAt: article.publishedAt || new Date().toISOString(),
      source: {
        id: article.source?.id || article.source?.name || 'newsapi',
        name: article.source?.name || 'Unknown Source'
      },
      author: article.author || undefined,
      category: determineCategory()
    };
  }
} 