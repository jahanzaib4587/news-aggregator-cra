export const API_CONFIG = {
  newsApi: {
    baseUrl: 'https://newsapi.org/v2',
    apiKey: process.env.REACT_APP_NEWSAPI_KEY || 'demo_key_newsapi',
    endpoints: {
      everything: '/everything',
      topHeadlines: '/top-headlines',
      sources: '/sources'
    }
  },
  guardian: {
    baseUrl: 'https://content.guardianapis.com',
    apiKey: process.env.REACT_APP_GUARDIAN_KEY || 'demo_key_guardian',
    endpoints: {
      search: '/search',
      sections: '/sections'
    }
  },
  nyTimes: {
    baseUrl: 'https://api.nytimes.com/svc',
    apiKey: process.env.REACT_APP_NYTIMES_KEY || 'demo_key_nytimes',
    endpoints: {
      search: '/search/v2/articlesearch.json',
      topStories: '/topstories/v2'
    }
  }
};

export const CATEGORIES = [
  { id: 'business', name: 'business', displayName: 'Business' },
  { id: 'entertainment', name: 'entertainment', displayName: 'Entertainment' },
  { id: 'general', name: 'general', displayName: 'General' },
  { id: 'health', name: 'health', displayName: 'Health' },
  { id: 'science', name: 'science', displayName: 'Science' },
  { id: 'sports', name: 'sports', displayName: 'Sports' },
  { id: 'technology', name: 'technology', displayName: 'Technology' }
];

export const SOURCES = [
  { id: 'newsapi', name: 'NewsAPI', displayName: 'NewsAPI (70,000+ sources)' },
  { id: 'guardian', name: 'The Guardian', displayName: 'The Guardian' },
  { id: 'nytimes', name: 'The New York Times', displayName: 'The New York Times' }
]; 