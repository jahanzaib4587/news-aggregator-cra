import { useState, useEffect, useCallback, useRef } from 'react';
import './App.css';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import ArticleList from './components/ArticleList';
import PreferencesModal from './components/PreferencesModal';
import type { SearchFilters, UserPreferences, EnhancedSearchFilters } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useLazyLoad } from './hooks/useLazyLoad';

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
        console.log('🔧 Clearing problematic preferences');
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

  const { articles, loading, hasMore, error, loadMore, refresh } = useLazyLoad({
    initialFilters: {},
    sources: getPreferredSources(),
    itemsPerPage: 12,
    skipInitialLoad: false // Enable initial load
  });

  const handleSearch = useCallback((filters: SearchFilters | EnhancedSearchFilters) => {
    // Convert EnhancedSearchFilters to SearchFilters for backward compatibility
    const basicFilters: SearchFilters = {
      keyword: filters.keyword,
      category: filters.category,
      source: filters.source,
      dateFrom: filters.dateFrom,
      dateTo: filters.dateTo
    };
    
    // If a specific source is selected, only fetch from that source
    let sourcesToUse = getPreferredSources();
    
    if (filters.source && filters.source !== '') {
      // Map the source filter to API sources
      if (filters.source === 'guardian' || filters.source === 'nytimes' || filters.source === 'newsapi') {
        sourcesToUse = [filters.source];
      }
    }
    
    refresh(basicFilters, sourcesToUse);
  }, [refresh, getPreferredSources]);

  const handlePreferencesSave = (newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
    // Refresh with new source preferences
    refresh({}, newPreferences.sources.length > 0 ? newPreferences.sources : ['newsapi', 'guardian', 'nytimes']);
  };

  // Temporary debug function to clear preferences
  const clearPreferences = () => {
    console.log('🗑️ Clearing all preferences');
    localStorage.removeItem('newsPreferences');
    setPreferences({
      sources: [],
      categories: [],
      authors: []
    });
    window.location.reload();
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
  }, []);

  return (
    <div className="app">
      <Header onOpenPreferences={() => setShowPreferences(true)} />
      
      <main className="main-content">
        <div className="search-section">
          <SearchBar onSearch={handleSearch} />
        </div>

        <ArticleList 
          articles={articles} 
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
