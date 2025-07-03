import React from 'react';
import { X } from 'lucide-react';
import { EnhancedSearchFilters } from '../types';

interface AppliedFiltersProps {
  filters: EnhancedSearchFilters;
  onRemove: (filterType: keyof EnhancedSearchFilters, value?: any) => void;
  onClearAll: () => void;
}

const DEFAULT_FILTERS: EnhancedSearchFilters = {
  keyword: undefined,
  category: undefined,
  source: undefined,
  dateFrom: undefined,
  dateTo: undefined
};

const AppliedFilters: React.FC<AppliedFiltersProps> = ({ filters, onRemove, onClearAll }) => {
  const activeFilters = Object.entries(filters).filter(([key, value]) => {
    return value !== undefined && value !== '' && value !== null;
  });

  if (activeFilters.length === 0) return null;

  const getFilterLabel = (key: string, value: any): string => {
    switch (key) {
      case 'keyword':
        return `Search: "${value}"`;
      case 'category':
        return `Category: ${value}`;
      case 'source':
        return `Source: ${value}`;
      case 'dateFrom':
        return `From: ${new Date(value).toLocaleDateString()}`;
      case 'dateTo':
        return `To: ${new Date(value).toLocaleDateString()}`;
      default:
        return `${key}: ${value}`;
    }
  };

  return (
    <div className="applied-filters">
      <div className="applied-filters-header">
        <span className="applied-filters-label">Active Filters ({activeFilters.length}):</span>
        <button 
          onClick={onClearAll} 
          className="clear-all-btn"
          aria-label="Clear all filters"
        >
          Clear All
        </button>
      </div>
      <div className="filter-chips">
        {activeFilters.map(([key, value]) => {
          const label = getFilterLabel(key, value);
          if (!label) return null;
          
          return (
            <div key={key} className="filter-chip">
              <span className="filter-chip-label">{label}</span>
              <button
                onClick={() => onRemove(key as keyof EnhancedSearchFilters)}
                className="filter-chip-remove"
                aria-label={`Remove ${label} filter`}
              >
                <X size={14} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default AppliedFilters; 