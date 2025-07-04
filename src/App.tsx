import { useState, useEffect, useMemo } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ArticleList from './components/ArticleList';
import PreferencesModal from './components/PreferencesModal';
import type { SearchFilters, EnhancedSearchFilters } from './types';
import { usePreferences } from './hooks/usePreferences';
import { useLazyLoad } from './hooks/useLazyLoad';
import cacheService from './services/cache.service';

function App() {
  const [showPreferences, setShowPreferences] = useState(false);
  const [isSpecificSourceSearch, setIsSpecificSourceSearch] = useState(false);
  
  // Use new preference management hook
  const {
    preferences,
    getPreferredSources,
    buildPreferenceFilters,
    shouldFilterClientSide,
    handlePreferencesSave,
    clearPreferences,
    createPreferenceChangeEffect
  } = usePreferences();

  const { articles, loading, hasMore, error, loadMore, refresh } = useLazyLoad({
    initialFilters: buildPreferenceFilters(),
    sources: getPreferredSources(),
    itemsPerPage: 12,
    skipInitialLoad: false
  });

  // Re-trigger API calls when preferences change
  useEffect(() => {
    const effectCallback = createPreferenceChangeEffect((filters, sources) => {
      setIsSpecificSourceSearch(false); // Reset flag when preferences change
      refresh(filters, sources);
    });
    
    return effectCallback();
  }, [preferences, refresh, createPreferenceChangeEffect]);

  // Filter articles by author preferences (client-side filtering for NewsAPI & Guardian only)
  // Only apply client-side filtering when NOT doing a specific source search
  const filteredArticles = useMemo(() => {
    if (!preferences.authors || preferences.authors.length === 0 || isSpecificSourceSearch) {
      return articles;
    }
    
    return articles.filter(article => shouldFilterClientSide(article));
  }, [articles, preferences.authors, shouldFilterClientSide, isSpecificSourceSearch]);

  const handleSearch = (filters: SearchFilters | EnhancedSearchFilters) => {
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
        setIsSpecificSourceSearch(true); // Set flag to bypass client-side filtering
      }
    } else {
      setIsSpecificSourceSearch(false); // Reset flag when no specific source is selected
    }
    
    // Clear cache when source changes to ensure fresh data
    cacheService.clear(); // Always clear cache for specific source searches
    
    refresh(enhancedFilters, sourcesToUse);
  };

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

