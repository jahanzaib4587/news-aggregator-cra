import { useState, useEffect, useRef, useCallback } from 'react';
import { Article, SearchFilters } from '../types';
import apiService from '../services/api.service';

interface UseLazyLoadProps {
  initialFilters?: SearchFilters;
  sources?: string[];
  itemsPerPage?: number;
  skipInitialLoad?: boolean;
}

interface UseLazyLoadReturn {
  articles: Article[];
  loading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  refresh: (filters?: SearchFilters, sources?: string[]) => void;
}

export const useLazyLoad = ({
  initialFilters = {},
  sources = ['newsapi', 'guardian', 'nytimes'],
  itemsPerPage = 12,
  skipInitialLoad = false
}: UseLazyLoadProps = {}): UseLazyLoadReturn => {
  const [articles, setArticles] = useState<Article[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const currentFilters = useRef<SearchFilters>(initialFilters);
  const currentSources = useRef<string[]>(sources);
  const allFetchedArticles = useRef<Article[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<string>('');

  const fetchArticles = useCallback(async (filters: SearchFilters, sourcesToUse: string[], reset = false) => {
    const requestKey = JSON.stringify({ filters, sourcesToUse });
    
    // Only skip if it's the exact same request and we're already loading
    if (loading && lastRequestRef.current === requestKey) {
      return;
    }
    
    // Only abort if this is a different request
    if (abortControllerRef.current && lastRequestRef.current !== requestKey) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    lastRequestRef.current = requestKey;
    
    setLoading(true);
    setError(null);

    try {
      const fetchedArticles = await apiService.fetchArticles(filters, sourcesToUse, abortControllerRef.current.signal);
      
      if (reset) {
        allFetchedArticles.current = fetchedArticles;
        const initialBatch = fetchedArticles.slice(0, itemsPerPage);
        setArticles(initialBatch);
        setPage(1);
        setHasMore(fetchedArticles.length > itemsPerPage);
      } else {
        const startIndex = page * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const newBatch = allFetchedArticles.current.slice(startIndex, endIndex);
        
        if (newBatch.length > 0) {
          setArticles(prev => [...prev, ...newBatch]);
          setPage(prev => prev + 1);
          setHasMore(endIndex < allFetchedArticles.current.length);
        } else {
          setHasMore(false);
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to load articles. Please try again.');
        console.error('Error fetching articles:', err);
      }
    } finally {
      setLoading(false);
    }
  }, [loading, page, itemsPerPage]);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      fetchArticles(currentFilters.current, currentSources.current, false);
    }
  }, [fetchArticles, loading, hasMore]);

  const refresh = useCallback((filters?: SearchFilters, sources?: string[]) => {
    const newFilters = filters || currentFilters.current;
    const newSources = sources || currentSources.current;
    
    currentFilters.current = newFilters;
    currentSources.current = newSources;
    
    fetchArticles(newFilters, newSources, true);
  }, [fetchArticles]);

  useEffect(() => {
    if (!skipInitialLoad) {
      // Directly call fetchArticles for initial load
      fetchArticles(initialFilters, sources, true);
    }
    
    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [skipInitialLoad]);

  return {
    articles,
    loading,
    hasMore,
    error,
    loadMore,
    refresh
  };
}; 