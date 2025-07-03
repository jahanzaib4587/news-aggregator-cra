import axios from 'axios';
import type { 
  Article, 
  SearchFilters,
  EnhancedSearchFilters,
  NewsApiResponse, 
  GuardianApiResponse, 
  NYTimesApiResponse,
  GuardianArticle,
  NYTimesArticle,
  NewsApiArticle 
} from '../types';
import { API_CONFIG } from '../config/api';
import { mockArticles } from '../data/mockData';
import cacheService from './cache.service';

class ApiService {
  private isValidApiKey(key: string): boolean {
    return Boolean(key) && key !== 'demo_key_newsapi' && key !== 'demo_key_guardian' && key !== 'demo_key_nytimes';
  }

  private getDefaultImage(): string {
    // Return a nice default image for articles without images
    return 'https://images.unsplash.com/photo-1504711434969-e33886168f5c?w=400&h=300&fit=crop&crop=entropy&auto=format&q=80';
  }

  private shouldUseMockData(): boolean {
    return !this.isValidApiKey(API_CONFIG.newsApi.apiKey) && 
           !this.isValidApiKey(API_CONFIG.guardian.apiKey) && 
           !this.isValidApiKey(API_CONFIG.nyTimes.apiKey);
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
    return filtered.map(article => ({
      ...article,
      urlToImage: article.urlToImage || this.getDefaultImage()
    }));
  }

  private normalizeNewsApiArticle(article: NewsApiArticle): Article {
    // Try to determine category from source or content
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

  private normalizeGuardianArticle(article: GuardianArticle): Article {
    // Map Guardian sections back to our standard categories
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

  private normalizeNYTimesArticle(article: NYTimesArticle): Article {
    // Get image URL from the multimedia array
    const imageUrl = article.multimedia && article.multimedia.length > 0 
                     ? article.multimedia[0].url 
                     : this.getDefaultImage();

    // Map NY Times sections back to our standard categories
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

  async fetchFromNewsApi(filters: EnhancedSearchFilters, signal?: AbortSignal): Promise<Article[]> {
    try {
      const params: Record<string, string | number> = {
        apiKey: API_CONFIG.newsApi.apiKey,
        pageSize: 50,
        language: 'en',
        sortBy: 'publishedAt' // Default to date sorting
      };

      // Use /everything endpoint for keyword searches, /top-headlines for category/general browsing
      const useEverything = Boolean(filters.keyword) || Boolean(filters.dateFrom) || Boolean(filters.dateTo);
      const endpoint = useEverything 
        ? API_CONFIG.newsApi.endpoints.everything 
        : API_CONFIG.newsApi.endpoints.topHeadlines;

      if (filters.keyword) {
        params.q = filters.keyword;
      }
      
      if (filters.category && filters.category !== 'all') {
        if (useEverything) {
          // For /everything endpoint, we need to use domains or sources
          // Since category filtering is limited, we'll search in title/description
          const categoryKeywords: Record<string, string> = {
            'business': 'business OR finance OR economy OR market',
            'technology': 'technology OR tech OR digital OR software',
            'science': 'science OR research OR study OR discovery',
            'health': 'health OR medical OR medicine OR healthcare',
            'sports': 'sports OR football OR basketball OR soccer',
            'entertainment': 'entertainment OR movie OR music OR celebrity',
            'general': 'news OR breaking OR world'
          };
          
          const categoryQuery = categoryKeywords[filters.category];
          if (categoryQuery) {
            params.q = filters.keyword 
              ? `(${filters.keyword}) AND (${categoryQuery})`
              : categoryQuery;
          }
        } else {
          // For /top-headlines, category parameter works directly
          params.category = filters.category;
        }
      }
      
      if (filters.dateFrom) {
        params.from = filters.dateFrom;
      }
      
      if (filters.dateTo) {
        params.to = filters.dateTo;
      }

      const response = await axios.get<NewsApiResponse>(
        `${API_CONFIG.newsApi.baseUrl}${endpoint}`,
        { params, signal }
      );

      if (response.data.articles) {
        return response.data.articles
          .filter(article => article.title && article.title !== '[Removed]')
          .map((article) => this.normalizeNewsApiArticle(article));
      }
      
      return [];
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      console.error('NewsAPI Error:', error);
      return [];
    }
  }

  async fetchFromGuardian(filters: EnhancedSearchFilters, signal?: AbortSignal): Promise<Article[]> {
    try {
      const params: Record<string, string | number> = {
        'api-key': API_CONFIG.guardian.apiKey,
        'page-size': 50,
        'show-fields': 'trailText,thumbnail,bodyText,byline',
        'order-by': 'newest' // Default to newest
      };

      if (filters.keyword) {
        params.q = filters.keyword;
      }
      
      if (filters.category && filters.category !== 'all') {
        // Map our standard categories to Guardian sections
        const categoryMapping: Record<string, string> = {
          'business': 'business',
          'technology': 'technology',
          'science': 'science',
          'health': 'society',
          'sports': 'sport',
          'entertainment': 'culture',
          'general': 'world'
        };
        
        const guardianSection = categoryMapping[filters.category] || filters.category;
        params.section = guardianSection;
      }
      
      if (filters.dateFrom) {
        params['from-date'] = filters.dateFrom;
      }
      
      if (filters.dateTo) {
        params['to-date'] = filters.dateTo;
      }

      const response = await axios.get<GuardianApiResponse>(
        `${API_CONFIG.guardian.baseUrl}${API_CONFIG.guardian.endpoints.search}`,
        { params, signal }
      );

      if (response.data.response?.results) {
        return response.data.response.results.map(article => this.normalizeGuardianArticle(article));
      }
      
      return [];
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      console.error('Guardian API Error:', error);
      return [];
    }
  }

  async fetchFromNYTimes(filters: EnhancedSearchFilters, signal?: AbortSignal): Promise<Article[]> {
    try {
      const params: Record<string, string> = {
        'api-key': API_CONFIG.nyTimes.apiKey,
        'sort': 'newest' // Default to newest
      };

      if (filters.keyword) {
        params.q = filters.keyword;
      }
      
      if (filters.category && filters.category !== 'all') {
        // Map our standard categories to NY Times sections
        const categoryMapping: Record<string, string> = {
          'business': 'Business',
          'technology': 'Technology',
          'science': 'Science',
          'health': 'Health',
          'sports': 'Sports',
          'entertainment': 'Arts',
          'general': 'World'
        };
        
        const nyTimesSection = categoryMapping[filters.category] || filters.category;
        // Append to existing fq if we already have one (e.g., from author filter)
        params.fq = params.fq 
          ? `${params.fq} AND section_name:"${nyTimesSection}"`
          : `section_name:"${nyTimesSection}"`;
      }
      
      if (filters.dateFrom) {
        // NY Times expects YYYYMMDD format
        params.begin_date = filters.dateFrom.replace(/-/g, '');
      }
      
      if (filters.dateTo) {
        // NY Times expects YYYYMMDD format  
        params.end_date = filters.dateTo.replace(/-/g, '');
      }

      const response = await axios.get<NYTimesApiResponse>(
        `${API_CONFIG.nyTimes.baseUrl}${API_CONFIG.nyTimes.endpoints.search}`,
        { params, signal }
      );

      if (response.data.response?.docs) {
        return response.data.response.docs.map(article => this.normalizeNYTimesArticle(article));
      }
      
      return [];
    } catch (error) {
      if (axios.isCancel(error)) {
        throw error;
      }
      console.error('NY Times API Error:', error);
      return [];
    }
  }

  async fetchArticles(filters: EnhancedSearchFilters, sources: string[], signal?: AbortSignal): Promise<Article[]> {
    // Check cache first - but not for empty filters (initial load)
    const isInitialLoad = !filters.keyword && !filters.category && !filters.source && !filters.dateFrom && !filters.dateTo;
    if (!isInitialLoad) {
      const cachedData = cacheService.get(filters, sources);
      if (cachedData) {
        console.log('Returning cached data');
        return cachedData;
      }
    }

    // Use mock data if no valid API keys are configured
    if (this.shouldUseMockData()) {
      console.log('Using mock data - no valid API keys configured');
      const mockData = this.filterMockData(filters);
      // Don't cache initial load mock data
      if (!isInitialLoad) {
        cacheService.set(filters, sources, mockData);
      }
      return mockData;
    }
    
    console.log('🔍 Fetching articles with filters:', filters, 'sources:', sources);

    const promises: Promise<Article[]>[] = [];

    // Fetch from specified sources
    if (sources.includes('newsapi')) {
      promises.push(this.fetchFromNewsApi(filters, signal));
    }
    if (sources.includes('guardian')) {
      promises.push(this.fetchFromGuardian(filters, signal));
    }
    if (sources.includes('nytimes')) {
      promises.push(this.fetchFromNYTimes(filters, signal));
    }

    // If no sources specified, fetch from all
    if (sources.length === 0) {
      promises.push(
        this.fetchFromNewsApi(filters, signal),
        this.fetchFromGuardian(filters, signal),
        this.fetchFromNYTimes(filters, signal)
      );
    }

    console.log(`🚀 Making ${promises.length} API calls in parallel`);
    const results = await Promise.allSettled(promises);
    const articles: Article[] = [];

    results.forEach((result, index) => {
      if (result.status === 'fulfilled') {
        console.log(`✅ API call ${index + 1} successful: ${result.value.length} articles`);
        articles.push(...result.value);
      } else {
        console.error(`❌ API call ${index + 1} failed:`, result.reason);
      }
    });

    // Remove duplicates based on title and URL
    const uniqueArticles = articles.filter((article, index, self) => 
      index === self.findIndex(a => 
        a.title === article.title || a.url === article.url
      )
    );

    console.log(`📊 Total articles: ${uniqueArticles.length} (${articles.length} before deduplication)`);

    // Default sorting by newest first
    const sortedArticles = uniqueArticles.sort((a, b) => 
      new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime()
    );

    // Cache the results
    cacheService.set(filters, sources, sortedArticles);
    
    return sortedArticles;
  }
}

export default new ApiService(); 