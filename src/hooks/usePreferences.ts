import { useCallback, useEffect, useRef } from 'react';
import { UserPreferences, EnhancedSearchFilters } from '../types';
import { useLocalStorage } from './useLocalStorage';
import { SearchFilterService } from '../services/searchFilter.service';
import localStorageService from '../services/localStorage.service';

export const usePreferences = () => {
  const isFirstMount = useRef(true);
  
  const [preferences, setPreferences] = useLocalStorage<UserPreferences>('newsPreferences', {
    sources: [],
    categories: [],
    authors: []
  });

  // Always enable enhanced search mode on mount
  useEffect(() => {
    localStorageService.setItem('useEnhancedSearch', true);
  }, []);

  // Temporary fix: Clear preferences if they only contain newsapi
  useEffect(() => {
    const storedPrefs = localStorageService.getItem<UserPreferences>('newsPreferences');
    if (storedPrefs && storedPrefs.sources && storedPrefs.sources.length === 1 && storedPrefs.sources[0] === 'newsapi') {
      localStorageService.removeItem('newsPreferences');
      setPreferences({
        sources: [],
        categories: [],
        authors: []
      });
    }
  }, [setPreferences]);

  const getPreferredSources = useCallback((): string[] => {
    return SearchFilterService.getPreferredSources(preferences);
  }, [preferences]);

  const buildPreferenceFilters = useCallback((): EnhancedSearchFilters => {
    return SearchFilterService.buildFiltersFromPreferences(preferences);
  }, [preferences]);

  const shouldFilterClientSide = useCallback((article: any): boolean => {
    return SearchFilterService.shouldFilterClientSide(article, preferences);
  }, [preferences]);

  const handlePreferencesSave = useCallback((newPreferences: UserPreferences) => {
    setPreferences(newPreferences);
  }, [setPreferences]);

  const clearPreferences = useCallback(() => {
    localStorageService.removeItem('newsPreferences');
    setPreferences({
      sources: [],
      categories: [],
      authors: []
    });
    if (typeof window !== 'undefined') {
      window.location.reload();
    }
  }, [setPreferences]);

  // Preference change detection helper
  const createPreferenceChangeEffect = useCallback((callback: (filters: EnhancedSearchFilters, sources: string[]) => void) => {
    return () => {
      if (isFirstMount.current) {
        isFirstMount.current = false;
        return;
      }

      const preferenceFilters = buildPreferenceFilters();
      const sourcesToUse = getPreferredSources();
      
      callback(preferenceFilters, sourcesToUse);
    };
  }, [buildPreferenceFilters, getPreferredSources]);

  return {
    preferences,
    setPreferences,
    getPreferredSources,
    buildPreferenceFilters,
    shouldFilterClientSide,
    handlePreferencesSave,
    clearPreferences,
    createPreferenceChangeEffect,
    isFirstMount: isFirstMount.current
  };
}; 