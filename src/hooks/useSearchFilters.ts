import { useState, useRef, useEffect, useCallback } from 'react';
import { SearchFilters, EnhancedSearchFilters } from '../types';
import { SearchFilterService } from '../services/searchFilter.service';
import { useLocalStorage } from './useLocalStorage';

interface UseSearchFiltersProps {
  onSearch: (filters: SearchFilters | EnhancedSearchFilters) => void;
  debounceMs?: number;
}

export const useSearchFilters = ({ onSearch, debounceMs = 500 }: UseSearchFiltersProps) => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  
  // Enhanced mode states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [savedSearches, setSavedSearches] = useLocalStorage<Array<{ name: string; filters: any }>>('savedSearches', []);
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSearchFilters = useRef<EnhancedSearchFilters>({});

  const buildFilters = useCallback((): EnhancedSearchFilters => {
    return SearchFilterService.buildFiltersFromSearchForm({
      keyword,
      category,
      source,
      dateFrom,
      dateTo
    });
  }, [keyword, category, source, dateFrom, dateTo]);

  const performSearch = useCallback((searchFilters: EnhancedSearchFilters) => {
    if (JSON.stringify(searchFilters) === JSON.stringify(lastSearchFilters.current)) {
      return;
    }
    
    lastSearchFilters.current = searchFilters;
    setIsSearching(true);
    onSearch(searchFilters);
    
    // Simulate search completion (in real app, this would be handled by a callback)
    setTimeout(() => setIsSearching(false), 800);
  }, [onSearch]);

  // Debounced search effect
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      performSearch(buildFilters());
    }, debounceMs);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [keyword, category, source, dateFrom, dateTo, performSearch, buildFilters, debounceMs]);

  const validateFilters = useCallback((filters: EnhancedSearchFilters): { isValid: boolean; error?: string } => {
    if (filters.dateFrom && filters.dateTo) {
      return SearchFilterService.validateDateRange(filters.dateFrom, filters.dateTo);
    }
    return { isValid: true };
  }, []);

  const handleFormSubmit = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    
    const filters = buildFilters();
    const validation = validateFilters(filters);
    
    if (!validation.isValid) {
      alert(validation.error);
      return;
    }

    performSearch(filters);
  }, [buildFilters, validateFilters, performSearch]);

  const handleFilterChange = useCallback((newFilters: Partial<EnhancedSearchFilters>) => {
    // Update state for each filter - the useEffect will trigger the search
    if (newFilters.category !== undefined) setCategory(newFilters.category);
    if (newFilters.source !== undefined) setSource(newFilters.source);
    if (newFilters.dateFrom !== undefined) setDateFrom(newFilters.dateFrom);
    if (newFilters.dateTo !== undefined) setDateTo(newFilters.dateTo);
  }, []);

  const clearFilters = useCallback(() => {
    setKeyword('');
    setCategory('');
    setSource('');
    setDateFrom('');
    setDateTo('');
  }, []);

  const clearFilter = useCallback((filterType: keyof EnhancedSearchFilters) => {
    switch (filterType) {
      case 'keyword':
        setKeyword('');
        break;
      case 'category':
        setCategory('');
        break;
      case 'source':
        setSource('');
        break;
      case 'dateFrom':
        setDateFrom('');
        break;
      case 'dateTo':
        setDateTo('');
        break;
    }
  }, []);

  const handleSaveSearch = useCallback(() => {
    if (saveSearchName.trim()) {
      setSavedSearches([...savedSearches, { name: saveSearchName, filters: buildFilters() }]);
      setSaveSearchName('');
      setShowSaveDialog(false);
    }
  }, [saveSearchName, savedSearches, setSavedSearches, buildFilters]);

  const applySavedSearch = useCallback((savedFilters: any) => {
    setKeyword(savedFilters.keyword || '');
    setCategory(savedFilters.category || '');
    setSource(savedFilters.source || '');
    setDateFrom(savedFilters.dateFrom || '');
    setDateTo(savedFilters.dateTo || '');
  }, []);

  const activeFilterCount = SearchFilterService.countActiveFilters(buildFilters());

  return {
    // Filter states
    keyword,
    category,
    source,
    dateFrom,
    dateTo,
    isSearching,
    
    // Filter setters
    setKeyword,
    setCategory,
    setSource,
    setDateFrom,
    setDateTo,
    
    // Save dialog states
    showSaveDialog,
    setShowSaveDialog,
    saveSearchName,
    setSaveSearchName,
    savedSearches,
    
    // Methods
    buildFilters,
    performSearch,
    validateFilters,
    handleFormSubmit,
    handleFilterChange,
    clearFilters,
    clearFilter,
    handleSaveSearch,
    applySavedSearch,
    
    // Computed values
    activeFilterCount,
    hasActiveFilters: activeFilterCount > 0
  };
}; 