import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ArticleList from './components/ArticleList';
import PreferencesModal from './components/PreferencesModal';
import type { SearchFilters, UserPreferences, EnhancedSearchFilters } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLazyLoad } from './hooks/useLazyLoad';
import cacheService from './services/cache.service';

function App() {
  const [showPreferences, setShowPreferences] = useState(false);
  const isFirstMount = useRef(true);
  
  // Always enable enhanced search mode
  useEffect(() => {
    localStorage.setItem('useEnhancedSearch', JSON.stringify(true));
  }, []);
  
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('newsPreferences', {
    sources: [],
    categories: [],
    authors: []
  });
  

  
  // Temporary fix: Clear preferences if they only contain newsapi
  useEffect(() => {
    const storedPrefs = localStorage.getItem('newsPreferences');
    if (storedPrefs) {
      const parsed = JSON.parse(storedPrefs);
      if (parsed.sources && parsed.sources.length === 1 && parsed.sources[0] === 'newsapi') {
        localStorage.removeItem('newsPreferences');
        setPreferences({
          sources: [],
          categories: [],
          authors: []
        });
      }
    }
  }, [setPreferences]);

  const getPreferredSources = useCallback((): string[] => {
    // If no source preferences are set, use all sources
    if (!preferences.sources || preferences.sources.length === 0) {
      return ['newsapi', 'guardian', 'nytimes'];
    }
    return preferences.sources;
  }, [preferences.sources]);

  // Convert preferences to API filter parameters
  const buildPreferenceFilters = useCallback((): EnhancedSearchFilters => {
    const filters: EnhancedSearchFilters = {}; 
    
    // Handle multiple categories based on API capabilities:
    // - NewsAPI: Only supports single category, uses first one only
    // - Guardian API: Supports multiple with pipe separator (section=business|sport)  
    // - NY Times API: Supports multiple with OR syntax (section_name:("Business" OR "Sports"))
    if (preferences.categories && preferences.categories.length > 0) {
      filters.category = preferences.categories.join(','); // Pass all, let API service handle the formatting
    }
    
    // Handle authors - only NY Times API supports author filtering
    // NewsAPI & Guardian APIs will ignore this parameter (handled client-side)
    if (preferences.authors && preferences.authors.length > 0) {
      filters.author = preferences.authors.join(','); // Pass all authors
    }
    
    return filters;
  }, [preferences.categories, preferences.authors]);

  const { articles, loading, hasMore, error, loadMore, refresh } = useLazyLoad({
    initialFilters: buildPreferenceFilters(),
    sources: getPreferredSources(),
    itemsPerPage: 12,
    skipInitialLoad: false
  });

  // Re-trigger API calls when preferences change
  useEffect(() => {
    if (isFirstMount.current) {
      isFirstMount.current = false;
      return;
    }
    
    // Build preference filters directly inside useEffect to avoid circular deps
    const preferenceFilters: EnhancedSearchFilters = {};
    
    if (preferences.categories && preferences.categories.length > 0) {
      preferenceFilters.category = preferences.categories.join(',');
    }
    
    if (preferences.authors && preferences.authors.length > 0) {
      preferenceFilters.author = preferences.authors.join(',');
    }
    
    // Get preferred sources directly inside useEffect to avoid circular deps
    const sourcesToUse = preferences.sources && preferences.sources.length > 0 
      ? preferences.sources 
      : ['newsapi', 'guardian', 'nytimes'];
    
    refresh(preferenceFilters, sourcesToUse);
  }, [preferences, refresh]);

  // Filter articles by author preferences (client-side filtering for NewsAPI & Guardian only)
  // NY Times API handles author filtering server-side via fq parameter
  const filteredArticles = useMemo(() => {
    if (!preferences.authors || preferences.authors.length === 0) {
      return articles;
    }
    
    // Only apply client-side filtering for articles from NewsAPI and Guardian
    // NY Times articles are already filtered server-side
    return articles.filter(article => {
      // Skip filtering for NY Times articles (they're already filtered server-side)
      if (article.source.name.toLowerCase().includes('times')) {
        return true;
      }
      
      if (!article.author) return false;
      
      const authorLower = article.author.toLowerCase();
      return preferences.authors.some(preferredAuthor => 
        authorLower.includes(preferredAuthor.toLowerCase())
      );
    });
  }, [articles, preferences.authors]);

  const handleSearch = useCallback((filters: SearchFilters | EnhancedSearchFilters) => {
    // Convert to EnhancedSearchFilters for API calls
    const enhancedFilters: EnhancedSearchFilters = {
      keyword: filters.keyword,
      category: filters.category,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
      // Note: source is handled separately via sourcesToUse parameter
    };
    
    // If a specific source is selected, only fetch from that source
    let sourcesToUse = getPreferredSources();
    
    if (filters.source && filters.source !== '') {
      // Map the source filter to API sources
      if (filters.source === 'guardian' || filters.source === 'nytimes' || filters.source === 'newsapi') {
        sourcesToUse = [filters.source];
      }
    }
    
    // Clear cache when source changes to ensure fresh data
    if (filters.source) {
      cacheService.clear();
    }
    
    refresh(enhancedFilters, sourcesToUse);
  }, [refresh, getPreferredSources]);

  const handlePreferencesSave = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    // Note: The useEffect will automatically trigger refresh when preferences change
  };

  // Temporary debug function to clear preferences
  const clearPreferences = useCallback(() => {
    localStorage.removeItem('newsPreferences');
    setPreferences({
      sources: [],
      categories: [],
      authors: []
    });
    window.location.reload();
  }, [setPreferences]);

  // Add keyboard shortcut to clear preferences (Ctrl+Alt+C)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.altKey && e.key === 'c') {
        clearPreferences();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [clearPreferences]);

  return (
    <div className="app">
      <Header onOpenPreferences={() => setShowPreferences(true)} />
      
      <main className="main-content">
        <div className="search-section">
          <SearchBar onSearch={handleSearch} />
        </div>

        <ArticleList 
          articles={filteredArticles} 
          loading={loading}
          hasMore={hasMore}
          error={error}
          onLoadMore={loadMore}
        />
      </main>

      <PreferencesModal
        isOpen={showPreferences}
        preferences={preferences}
        onSave={handlePreferencesSave}
        onClose={() => setShowPreferences(false)}
      />
    </div>
  );
}

export default App;

