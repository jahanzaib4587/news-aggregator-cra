import React, { useState, useRef, useEffect } from 'react';
import { Search, Filter, Calendar, X, Save, History, ChevronDown } from 'lucide-react';
import { SearchFilters, EnhancedSearchFilters } from '../types';
import { CATEGORIES, SOURCES } from '../config/api';
import { useLocalStorage } from '../hooks/useLocalStorage';
import AppliedFilters from './AppliedFilters';

interface SearchBarProps {
  onSearch: (filters: SearchFilters | EnhancedSearchFilters) => void;
}

const SearchBar: React.FC<SearchBarProps> = ({ onSearch }) => {
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [source, setSource] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [showFromDateDropdown, setShowFromDateDropdown] = useState(false);
  const [showToDateDropdown, setShowToDateDropdown] = useState(false);
  
  // Enhanced mode states
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');
  const [savedSearches, setSavedSearches] = useLocalStorage<Array<{ name: string; filters: any }>>('savedSearches', []);
  
  const debounceTimer = useRef<NodeJS.Timeout | null>(null);
  const lastSearchFilters = useRef<SearchFilters>({});
  const inputRef = useRef<HTMLInputElement>(null);
  const fromDateRef = useRef<HTMLDivElement>(null);
  const toDateRef = useRef<HTMLDivElement>(null);

  const buildFilters = (): EnhancedSearchFilters => ({
    keyword: keyword.trim() || undefined,
    category: category || undefined,
    source: source || undefined,
    dateFrom: dateFrom || undefined,
    dateTo: dateTo || undefined
  });

  const performSearch = (searchFilters: EnhancedSearchFilters) => {
    if (JSON.stringify(searchFilters) === JSON.stringify(lastSearchFilters.current)) {
      return;
    }
    
    lastSearchFilters.current = searchFilters;
    setIsSearching(true);
    onSearch(searchFilters);
    
    // Simulate search completion (in real app, this would be handled by a callback)
    setTimeout(() => setIsSearching(false), 800);
  };

  useEffect(() => {
    // Debounced search for filter changes
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    debounceTimer.current = setTimeout(() => {
      performSearch(buildFilters());
    }, 500);
    
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [keyword, category, source, dateFrom, dateTo]);

  useEffect(() => {
    // Close date dropdowns when clicking outside
    const handleClickOutside = (event: MouseEvent) => {
      if (fromDateRef.current && !fromDateRef.current.contains(event.target as Node)) {
        setShowFromDateDropdown(false);
      }
      if (toDateRef.current && !toDateRef.current.contains(event.target as Node)) {
        setShowToDateDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      // Simply trigger search on Enter
      handleSearch(e as any);
    }
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (dateFrom && dateTo && new Date(dateFrom) > new Date(dateTo)) {
      alert('From date cannot be later than to date');
      return;
    }

    const today = new Date().toISOString().split('T')[0];
    if (dateFrom && dateFrom > today) {
      alert('From date cannot be in the future');
      return;
    }
    if (dateTo && dateTo > today) {
      alert('To date cannot be in the future');
      return;
    }
  };

  const handleFilterChange = (newFilters: Partial<EnhancedSearchFilters>) => {
    // Update state for each filter - the useEffect will trigger the search
    if (newFilters.category !== undefined) setCategory(newFilters.category);
    if (newFilters.source !== undefined) setSource(newFilters.source);
    if (newFilters.dateFrom !== undefined) setDateFrom(newFilters.dateFrom);
    if (newFilters.dateTo !== undefined) setDateTo(newFilters.dateTo);
  };

  const clearFilters = () => {
    // Clear all filters - the useEffect will trigger the search
    setKeyword('');
    setCategory('');
    setSource('');
    setDateFrom('');
    setDateTo('');
  };

  const clearFilter = (filterType: keyof EnhancedSearchFilters) => {
    // Clear individual filter - the useEffect will trigger the search
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
  };

  const handleSaveSearch = () => {
    if (saveSearchName.trim()) {
      setSavedSearches([...savedSearches, { name: saveSearchName, filters: buildFilters() }]);
      setSaveSearchName('');
      setShowSaveDialog(false);
    }
  };

  const applySavedSearch = (savedFilters: any) => {
    // Apply saved search filters - the useEffect will trigger the search
    setKeyword(savedFilters.keyword || '');
    setCategory(savedFilters.category || '');
    setSource(savedFilters.source || '');
    setDateFrom(savedFilters.dateFrom || '');
    setDateTo(savedFilters.dateTo || '');
  };

  const activeFilterCount = Object.entries(buildFilters()).filter(([key, value]) => {
    return value !== '' && value !== undefined && value !== null;
  }).length;

  // Date utility functions
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  const formatDateDisplay = (dateStr: string): string => {
    if (!dateStr) return '';
    const date = new Date(dateStr);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const getDatePresets = () => {
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    
    const lastWeek = new Date(today);
    lastWeek.setDate(today.getDate() - 7);
    
    const lastMonth = new Date(today);
    lastMonth.setMonth(today.getMonth() - 1);
    
    const last3Months = new Date(today);
    last3Months.setMonth(today.getMonth() - 3);

    return [
      { label: 'Today', value: formatDate(today) },
      { label: 'Yesterday', value: formatDate(yesterday) },
      { label: 'Last 7 days', value: formatDate(lastWeek) },
      { label: 'Last month', value: formatDate(lastMonth) },
      { label: 'Last 3 months', value: formatDate(last3Months) }
    ];
  };

  const handleDatePresetSelect = (value: string, isFromDate: boolean) => {
    if (isFromDate) {
      setDateFrom(value);
      setShowFromDateDropdown(false);
    } else {
      setDateTo(value);
      setShowToDateDropdown(false);
    }
  };



  return (
    <div className="search-container">
      <div className="search-wrapper">
        <div className={`search-input-container ${isSearching ? 'searching' : ''}`}>
          <Search className="search-icon" size={20} />
          <input
            ref={inputRef}
            type="text"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search articles..."
            className="search-input"
          />
          {keyword && (
            <button
              type="button"
              onClick={() => setKeyword('')}
              className="clear-search-btn"
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
          
          <div className="search-actions">
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className={`filter-toggle-btn ${activeFilterCount > 0 ? 'has-active-filters' : ''}`}
              title={showFilters ? 'Hide filters' : 'Show filters'}
            >
              <Filter size={20} />
              {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
            </button>
          </div>
        </div>
        
        {isSearching && !showFilters && (
          <div className="search-status loading">
            Searching articles...
          </div>
        )}

        <AppliedFilters
          filters={buildFilters()}
          onRemove={clearFilter}
          onClearAll={clearFilters}
        />

        {showFilters && (
          <div className="filters-container">
            <button
              type="button"
              onClick={() => setShowFilters(false)}
              className="filters-close-btn"
              aria-label="Close filters"
            >
              <X size={18} />
            </button>
            
            <div className="filter-group">
              <label>Category</label>
              <select
                value={category}
                onChange={(e) => handleFilterChange({ category: e.target.value })}
                className="filter-select"
              >
                <option value="">All Categories</option>
                {CATEGORIES.map(cat => (
                  <option key={cat.id} value={cat.id}>
                    {cat.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>Source</label>
              <select
                value={source}
                onChange={(e) => handleFilterChange({ source: e.target.value })}
                className="filter-select"
              >
                <option value="">All Sources</option>
                {SOURCES.map(src => (
                  <option key={src.id} value={src.id}>
                    {src.displayName}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-group">
              <label>From Date</label>
              <div className="custom-date-input-container" ref={fromDateRef}>
                <div className="custom-date-input" onClick={() => setShowFromDateDropdown(!showFromDateDropdown)}>
                  <Calendar size={16} className="date-icon" />
                  <input
                    type="text"
                    value={dateFrom ? formatDateDisplay(dateFrom) : ''}
                    onFocus={() => setShowFromDateDropdown(true)}
                    placeholder="Select date..."
                    className="date-input-field filter-input"
                    readOnly
                  />
                  <ChevronDown size={16} className={`dropdown-arrow ${showFromDateDropdown ? 'open' : ''}`} />
                </div>
                {showFromDateDropdown && (
                  <div className="date-dropdown">
                    {getDatePresets().map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="date-preset-btn"
                        onClick={() => handleDatePresetSelect(preset.value, true)}
                      >
                        <span className="preset-label">{preset.label}</span>
                        <span className="preset-date">{formatDateDisplay(preset.value)}</span>
                      </button>
                    ))}
                    <div className="date-separator"></div>
                    <button
                      type="button"
                      className="date-preset-btn clear-date"
                      onClick={() => handleDatePresetSelect('', true)}
                    >
                      <X size={14} />
                      Clear date
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="filter-group">
              <label>To Date</label>
              <div className="custom-date-input-container" ref={toDateRef}>
                <div className="custom-date-input" onClick={() => setShowToDateDropdown(!showToDateDropdown)}>
                  <Calendar size={16} className="date-icon" />
                  <input
                    type="text"
                    value={dateTo ? formatDateDisplay(dateTo) : ''}
                    onFocus={() => setShowToDateDropdown(true)}
                    placeholder="Select date..."
                    className="date-input-field filter-input"
                    readOnly
                  />
                  <ChevronDown size={16} className={`dropdown-arrow ${showToDateDropdown ? 'open' : ''}`} />
                </div>
                {showToDateDropdown && (
                  <div className="date-dropdown">
                    {getDatePresets().map((preset) => (
                      <button
                        key={preset.label}
                        type="button"
                        className="date-preset-btn"
                        onClick={() => handleDatePresetSelect(preset.value, false)}
                      >
                        <span className="preset-label">{preset.label}</span>
                        <span className="preset-date">{formatDateDisplay(preset.value)}</span>
                      </button>
                    ))}
                    <div className="date-separator"></div>
                    <button
                      type="button"
                      className="date-preset-btn clear-date"
                      onClick={() => handleDatePresetSelect('', false)}
                    >
                      <X size={14} />
                      Clear date
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="filter-actions">
              <button
                type="button"
                onClick={clearFilters}
                className="clear-filters-btn"
              >
                Clear Filters
              </button>
            </div>

            <div className="enhanced-filter-actions">
              {savedSearches.length > 0 && (
                <div className="saved-searches-dropdown">
                  <History size={16} />
                  <select
                    onChange={(e) => {
                      if (e.target.value) {
                        const saved = savedSearches.find(s => s.name === e.target.value);
                        if (saved) applySavedSearch(saved.filters);
                      }
                    }}
                    className="saved-search-select"
                  >
                    <option value="">Load saved search...</option>
                    {savedSearches.map(search => (
                      <option key={search.name} value={search.name}>
                        {search.name}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <button
                type="button"
                onClick={() => setShowSaveDialog(true)}
                className="save-search-btn"
                disabled={activeFilterCount === 0}
              >
                <Save size={16} />
                Save Search
              </button>
            </div>
          </div>
        )}
      </div>

      {showSaveDialog && (
        <div className="save-search-dialog">
          <div className="dialog-content">
            <h3>Save Current Search</h3>
            <input
              type="text"
              value={saveSearchName}
              onChange={(e) => setSaveSearchName(e.target.value)}
              placeholder="Enter search name..."
              className="save-search-input"
              autoFocus
            />
            <div className="dialog-actions">
              <button onClick={() => setShowSaveDialog(false)}>Cancel</button>
              <button onClick={handleSaveSearch} disabled={!saveSearchName.trim()}>
                Save
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchBar; 