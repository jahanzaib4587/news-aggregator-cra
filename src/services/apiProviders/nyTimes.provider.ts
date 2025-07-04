import axios from 'axios';
import { BaseApiProvider } from './apiProvider.interface';
import { Article, EnhancedSearchFilters, NYTimesArticle, NYTimesApiResponse } from '../../types';

export class NYTimesApiProvider extends BaseApiProvider {
  readonly name = 'The New York Times';
  readonly id = 'nytimes';

  supportsFeature(feature: 'categories' | 'authors' | 'dateRange' | 'fullTextSearch'): boolean {
    switch (feature) {
      case 'categories': return true;
      case 'authors': return true; // Server-side filtering
      case 'dateRange': return true;
      case 'fullTextSearch': return true;
      default: return false;
    }
  }

  async fetchArticles(filters: EnhancedSearchFilters, signal?: AbortSignal, page: number = 0): Promise<Article[]> {
    const params: Record<string, string | number> = {
      'api-key': this.config.apiKey,
      sort: 'newest',
      page: page,
      fl: 'web_url,snippet,lead_paragraph,abstract,print_page,blog,source,multimedia,headline,byline,pub_date,document_type,news_desk,section_name,type_of_material,_id,word_count,uri'
    };

    if (filters.keyword) {
      params.q = filters.keyword;
    }

    if (filters.category && filters.category !== 'all') {
      const categories = filters.category.split(',');
      const nyTimesSections = categories.map(cat => this.mapCategoryToNYTimesSection(cat));
      if (nyTimesSections.length > 1) {
        params.fq = `section_name:("${nyTimesSections.join('" OR "')}")`;
      } else {
        params.fq = `section_name:"${nyTimesSections[0]}"`;
      }
    }

    if (filters.author) {
      const authors = filters.author.split(',');
      const authorQuery = authors.map(author => `"${author.trim()}"`).join(' OR ');
      const authorFq = `byline:(${authorQuery})`;
      
      if (params.fq) {
        params.fq += ` AND ${authorFq}`;
      } else {
        params.fq = authorFq;
      }
    }

    if (filters.dateFrom) {
      params.begin_date = filters.dateFrom.replace(/-/g, '');
    }

    if (filters.dateTo) {
      params.end_date = filters.dateTo.replace(/-/g, '');
    }

    try {
      const response = await axios.get<NYTimesApiResponse>(
        `${this.config.baseUrl}${this.config.endpoints.search}`,
        { params, signal }
      );

      if (response.data.status !== 'OK') {
        throw new Error(`NY Times API error: ${response.data.status}`);
      }

      const articles = response.data.response.docs.map(article => this.normalizeArticle(article));

      return articles;
    } catch (error) {
      if (axios.isCancel(error) || (error as any).name === 'AbortError') {
        throw error;
      }
      console.warn(`NY Times API page ${page} failed:`, error);
      throw error;
    }
  }

  private mapCategoryToNYTimesSection(category: string): string {
    const categoryMap: Record<string, string> = {
      'business': 'Business',
      'technology': 'Technology',
      'science': 'Science',
      'health': 'Health',
      'sports': 'Sports',
      'entertainment': 'Arts',
      'general': 'World'
    };
    
    return categoryMap[category] || 'World';
  }

  normalizeArticle(article: NYTimesArticle): Article {
    const imageUrl = article.multimedia?.default?.url || 
                     article.multimedia?.thumbnail?.url || 
                     this.getDefaultImage();

    const sectionToCategory: Record<string, string> = {
      'business': 'business',
      'technology': 'technology',
      'science': 'science', 
      'health': 'health',
      'sports': 'sports',
      'arts': 'entertainment',
      'movies': 'entertainment',
      'theater': 'entertainment',
      'world': 'general',
      'us': 'general',
      'politics': 'general'
    };

    const sectionName = article.section_name?.toLowerCase() || 'general';
    const category = sectionToCategory[sectionName] || 'general';

    return {
      id: article._id || `nytimes-${Date.now()}-${Math.random()}`,
      title: article.headline?.main || 'No Title Available', 
      description: article.abstract || 'No description available',
      url: article.web_url || '#',
      urlToImage: imageUrl,
      publishedAt: article.pub_date || new Date().toISOString(),
      source: {
        id: 'nytimes',
        name: 'The New York Times'
      },
      author: article.byline?.original?.replace('By ', '') || undefined,
      category: category
    };
  }
} 