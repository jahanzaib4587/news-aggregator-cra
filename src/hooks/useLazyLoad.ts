import { useState, useEffect, useRef, useCallback } from 'react';
import { Article, EnhancedSearchFilters } from '../types';
import apiService from '../services/api.service';

interface UseLazyLoadProps {
  initialFilters?: EnhancedSearchFilters;
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
  refresh: (filters?: EnhancedSearchFilters, sources?: string[]) => void;
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
  const currentFilters = useRef<EnhancedSearchFilters>(initialFilters);
  const currentSources = useRef<string[]>(sources);
  const allFetchedArticles = useRef<Article[]>([]);
  const abortControllerRef = useRef<AbortController | null>(null);
  const lastRequestRef = useRef<string>('');
  const loadingRef = useRef<boolean>(false);
  const currentApiPage = useRef<number>(0); // Track NY Times API page

  const fetchArticles = useCallback(async (filters: EnhancedSearchFilters, sourcesToUse: string[], reset = false) => {
    const isNYTimesOnly = sourcesToUse.length === 1 && sourcesToUse[0] === 'nytimes';
    const apiPageToUse = reset ? 0 : currentApiPage.current;
    const requestKey = JSON.stringify({ filters, sourcesToUse, reset, apiPage: apiPageToUse });
    
    // Only skip if it's the exact same request and we're already loading
    if (loadingRef.current && lastRequestRef.current === requestKey && !reset) {
      return;
    }
    
    // Only abort if this is a different request
    if (abortControllerRef.current && lastRequestRef.current !== requestKey) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    lastRequestRef.current = requestKey;
    
    loadingRef.current = true;
    setLoading(true);
    setError(null);

    try {
      // For NY Times, pass the API page; for others, don't pass page (they fetch all)
      const fetchedArticles = await apiService.fetchArticles(
        filters, 
        sourcesToUse, 
        abortControllerRef.current.signal,
        isNYTimesOnly ? apiPageToUse : undefined
      );
      

      
      if (reset) {
        // Reset: set initial articles and reset pagination
        currentApiPage.current = 0;
        
        if (isNYTimesOnly) {
          // For NY Times, articles are already paginated by the API
          setArticles(fetchedArticles);
          setPage(1);
          setHasMore(fetchedArticles.length >= 10); // NY Times returns 10 per page
          currentApiPage.current = 1; // Next page to fetch
        } else {
          // For other providers, store all articles and paginate client-side
          allFetchedArticles.current = fetchedArticles;
          const initialBatch = fetchedArticles.slice(0, itemsPerPage);
          setArticles(initialBatch);
          setPage(1);
          setHasMore(fetchedArticles.length > itemsPerPage);
        }
        

      } else {
        // Load more: different behavior for NY Times vs others
        if (isNYTimesOnly) {
          // For NY Times, append new articles from API
          if (fetchedArticles.length > 0) {
            setArticles(prev => [...prev, ...fetchedArticles]);
            setHasMore(fetchedArticles.length >= 10); // Continue if we got full page
            currentApiPage.current += 1; // Increment for next load
          } else {
            setHasMore(false);
          }
        } else {
          // For other providers, use client-side pagination
          setPage(currentPage => {
            const startIndex = currentPage * itemsPerPage;
            const endIndex = startIndex + itemsPerPage;
            const newBatch = allFetchedArticles.current.slice(startIndex, endIndex);
            
            if (newBatch.length > 0) {
              setArticles(prev => [...prev, ...newBatch]);
              setHasMore(endIndex < allFetchedArticles.current.length);
              return currentPage + 1;
            } else {
              setHasMore(false);
              return currentPage;
            }
          });
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        setError('Failed to load articles. Please try again.');
        console.error('Error fetching articles:', err);
      }
    } finally {
      loadingRef.current = false;
      setLoading(false);
    }
  }, [itemsPerPage]);

  const loadMore = useCallback(() => {
    if (!loadingRef.current && hasMore) {
      fetchArticles(currentFilters.current, currentSources.current, false);
    }
  }, [fetchArticles, hasMore]);

  const refresh = useCallback((filters?: EnhancedSearchFilters, sources?: string[]) => {
    const newFilters = filters || currentFilters.current;
    const newSources = sources || currentSources.current;
    
    currentFilters.current = newFilters;
    currentSources.current = newSources;
    currentApiPage.current = 0; // Reset NY Times API page on refresh
    
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