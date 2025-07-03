import type { Article } from '../types';

export const mockArticles: Article[] = [
  {
    id: '1',
    title: 'Breaking: AI Technology Revolutionizes Healthcare Industry',
    description: 'New artificial intelligence system helps doctors diagnose diseases faster and more accurately than ever before.',
    content: 'In a groundbreaking development, researchers have unveiled an AI system that can analyze medical images with unprecedented accuracy...',
    url: 'https://example.com/ai-healthcare',
    urlToImage: 'https://via.placeholder.com/400x200/4338ca/ffffff?text=AI+Healthcare',
    publishedAt: '2024-01-15T10:30:00Z',
    source: {
      id: 'tech-news',
      name: 'Tech News Daily'
    },
    author: 'Dr. Sarah Johnson',
    category: 'technology'
  },
  {
    id: '2',
    title: 'Climate Change Summit Reaches Historic Agreement',
    description: 'World leaders pledge unprecedented action to combat climate change with $2 trillion investment plan.',
    content: 'After days of intense negotiations, representatives from 190 countries have reached a consensus...',
    url: 'https://example.com/climate-summit',
    urlToImage: 'https://via.placeholder.com/400x200/059669/ffffff?text=Climate+Summit',
    publishedAt: '2024-01-14T16:45:00Z',
    source: {
      id: 'global-news',
      name: 'Global News Network'
    },
    author: 'Michael Chen',
    category: 'science'
  },
  {
    id: '3',
    title: 'Stock Markets Rally as Tech Sector Shows Strong Growth',
    description: 'Major technology companies report better-than-expected earnings, driving market optimism.',
    content: 'The stock market experienced significant gains today as several major technology companies...',
    url: 'https://example.com/stock-rally',
    urlToImage: 'https://via.placeholder.com/400x200/dc2626/ffffff?text=Stock+Market',
    publishedAt: '2024-01-14T14:20:00Z',
    source: {
      id: 'business-wire',
      name: 'Business Wire'
    },
    author: 'Jennifer Martinez',
    category: 'business'
  },
  {
    id: '4',
    title: 'New Breakthrough in Renewable Energy Storage',
    description: 'Scientists develop revolutionary battery technology that could store renewable energy for weeks.',
    content: 'A team of researchers at MIT has announced a major breakthrough in energy storage technology...',
    url: 'https://example.com/energy-storage',
    urlToImage: 'https://via.placeholder.com/400x200/16a34a/ffffff?text=Energy+Storage',
    publishedAt: '2024-01-13T09:15:00Z',
    source: {
      id: 'science-today',
      name: 'Science Today'
    },
    author: 'Prof. David Williams',
    category: 'science'
  },
  {
    id: '5',
    title: 'Olympic Games Preparation Underway',
    description: 'Athletes from around the world prepare for upcoming Olympic Games with record-breaking performances.',
    content: 'With the Olympic Games just months away, athletes are showcasing incredible performances...',
    url: 'https://example.com/olympics-prep',
    urlToImage: 'https://via.placeholder.com/400x200/7c3aed/ffffff?text=Olympics',
    publishedAt: '2024-01-12T18:30:00Z',
    source: {
      id: 'sports-center',
      name: 'Sports Center'
    },
    author: 'Alex Rodriguez',
    category: 'sports'
  },
  {
    id: '6',
    title: 'Revolutionary Cancer Treatment Shows Promise',
    description: 'New immunotherapy treatment shows 90% success rate in clinical trials for aggressive cancers.',
    content: 'Medical researchers have announced promising results from phase 3 trials of a new cancer treatment...',
    url: 'https://example.com/cancer-treatment',
    urlToImage: 'https://via.placeholder.com/400x200/0891b2/ffffff?text=Medical+Research',
    publishedAt: '2024-01-11T12:00:00Z',
    source: {
      id: 'medical-journal',
      name: 'Medical Journal Weekly'
    },
    author: 'Dr. Lisa Thompson',
    category: 'health'
  }
]; 