export interface Article {
  id: string;
  title: string;
  description: string;
  content?: string;
  url: string;
  urlToImage: string;
  publishedAt: string;
  source: {
    id: string;
    name: string;
  };
  author?: string;
  category: string;
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
  source: {
    id: string | null;
    name: string;
  };
  author: string | null;
  title: string;
  description: string;
  url: string;
  urlToImage: string | null;
  publishedAt: string;
  content: string;
}

export interface GuardianApiResponse {
  response: {
    status: string;
    results: GuardianArticle[];
  };
}

export interface GuardianArticle {
  id: string;
  type: string;
  sectionId: string;
  sectionName: string;
  webPublicationDate: string;
  webTitle: string;
  webUrl: string;
  apiUrl: string;
  fields?: {
    trailText?: string;
    thumbnail?: string;
    bodyText?: string;
    byline?: string;
  };
}

export interface NYTimesApiResponse {
  status: string;
  response: {
    docs: NYTimesArticle[];
    meta: {
      hits: number;
      offset: number;
      time: number;
    };
  };
}

export interface NYTimesArticle {
  abstract: string;
  web_url: string;
  snippet: string;
  lead_paragraph: string;
  source: string;
  multimedia: {
    rank: number;
    subtype: string;
    caption: string;
    credit: string;
    type: string;
    url: string;
    height: number;
    width: number;
    legacy: {
      xlarge: string;
      xlargewidth: number;
      xlargeheight: number;
    };
    subType: string;
    crop_name: string;
    [key: string]: any;
  }[];
  headline: {
    main: string;
    kicker: string;
    content_kicker: string;
    print_headline: string;
    name: string;
    seo: string;
    sub: string;
  };
  keywords: Array<{
    name: string;
    value: string;
    rank: number;
    major: string;
  }>;
  pub_date: string;
  document_type: string;
  news_desk: string;
  section_name: string;
  byline: {
    original: string;
    person: Array<{
      firstname: string;
      middlename: string;
      lastname: string;
      qualifier: string;
      title: string;
      role: string;
      organization: string;
      rank: number;
    }>;
    organization: string;
  };
  type_of_material: string;
  _id: string;
  word_count: number;
  uri: string;
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

export interface EnhancedSearchFilters extends SearchFilters {
  // All properties are optional, inheriting from SearchFilters
} 