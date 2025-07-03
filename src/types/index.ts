export interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: NewsSource;
  author?: string;
  category?: string;
}

export interface NewsSource {
  id: string;
  name: string;
}

export interface Category {
  id: string;
  name: string;
  displayName: string;
}

export interface NewsApiResponse {
  status: string;
  totalResults: number;
  articles: NewsApiArticle[];
}

export interface NewsApiArticle {
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage?: string;
  publishedAt: string;
  source: {
    id?: string;
    name: string;
  };
  author?: string;
}

export interface GuardianApiResponse {
  response: {
    status: string;
    total: number;
    results: GuardianArticle[];
  };
}

export interface GuardianArticle {
  id: string;
  webTitle: string;
  webUrl: string;
  apiUrl: string;
  fields?: {
    trailText?: string;
    thumbnail?: string;
    bodyText?: string;
    byline?: string;
  };
  webPublicationDate: string;
  sectionName?: string;
}

export interface NYTimesApiResponse {
  status: string;
  response: {
    docs: NYTimesArticle[];
  };
}

export interface NYTimesArticle {
  _id: string;
  headline: {
    main: string;
  };
  abstract: string;
  web_url: string;
  multimedia?: {
    default?: {
      url: string;
      height: number;
      width: number;
    };
    thumbnail?: {
      url: string;
      height: number;
      width: number;
    };
    caption?: string;
    credit?: string;
  };
  pub_date: string;
  byline?: {
    original?: string;
  };
  section_name?: string;
}

export interface SearchFilters {
  keyword?: string;
  category?: string;
  source?: string;
  dateFrom?: string;
  dateTo?: string;
}

export interface UserPreferences {
  sources: string[];
  categories: string[];
  authors: string[];
}

export type ApiSource = 'newsapi' | 'guardian' | 'nytimes';

// Enhanced Search Types
export interface SearchSuggestion {
  id: string;
  text: string;
  type: 'keyword' | 'category' | 'source' | 'recent';
  count?: number;
}

export interface FacetOption {
  value: string;
  label: string;
  count: number;
}

export interface Facet {
  name: string;
  field: string;
  options: FacetOption[];
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  userId?: string;
  createdAt: string;
}

export type SortOption = 'relevance' | 'date_desc' | 'date_asc' | 'popularity' | 'trending';

export interface EnhancedSearchFilters extends SearchFilters {
  sortBy?: SortOption;
  sentiment?: 'positive' | 'negative' | 'neutral' | 'all';
  resultCount?: number;
} 