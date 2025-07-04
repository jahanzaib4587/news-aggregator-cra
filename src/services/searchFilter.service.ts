import { EnhancedSearchFilters, UserPreferences } from '../types';

export class SearchFilterService {
  static validateDateRange(dateFrom: string, dateTo: string): { isValid: boolean; error?: string } {
    if (!dateFrom || !dateTo) return { isValid: true };
    
    if (new Date(dateFrom) > new Date(dateTo)) {
      return { isValid: false, error: 'From date cannot be later than to date' };
    }
    
    const today = new Date().toISOString().split('T')[0];
    if (dateFrom > today) {
      return { isValid: false, error: 'From date cannot be in the future' };
    }
    
    if (dateTo > today) {
      return { isValid: false, error: 'To date cannot be in the future' };
    }
    
    return { isValid: true };
  }

  static buildFiltersFromPreferences(preferences: UserPreferences): EnhancedSearchFilters {
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
  }

  static buildFiltersFromSearchForm(formData: {
    keyword?: string;
    category?: string;
    source?: string;
    dateFrom?: string;
    dateTo?: string;
  }): EnhancedSearchFilters {
    return {
      keyword: formData.keyword?.trim() || undefined,
      category: formData.category || undefined,
      source: formData.source || undefined,
      dateFrom: formData.dateFrom || undefined,
      dateTo: formData.dateTo || undefined
    };
  }

  static combineFilters(baseFilters: EnhancedSearchFilters, additionalFilters: EnhancedSearchFilters): EnhancedSearchFilters {
    return {
      ...baseFilters,
      ...additionalFilters,
      // Special handling for arrays/comma-separated values
      category: additionalFilters.category || baseFilters.category,
      author: additionalFilters.author || baseFilters.author
    };
  }

  static getPreferredSources(preferences: UserPreferences): string[] {
    // If no source preferences are set, use all sources
    if (!preferences.sources || preferences.sources.length === 0) {
      return ['newsapi', 'guardian', 'nytimes'];
    }
    return preferences.sources;
  }

  static shouldFilterClientSide(article: any, preferences: UserPreferences): boolean {
    if (!preferences.authors || preferences.authors.length === 0) {
      return true;
    }
    
    // Only apply client-side filtering for articles from NewsAPI and Guardian
    // NY Times articles are already filtered server-side
    if (article.source.name.toLowerCase().includes('times')) {
      return true;
    }
    
    if (!article.author) return false;
    
    const authorLower = article.author.toLowerCase();
    return preferences.authors.some(preferredAuthor => 
      authorLower.includes(preferredAuthor.toLowerCase())
    );
  }

  static hasActiveFilters(filters: EnhancedSearchFilters): boolean {
    return Object.entries(filters).some(([key, value]) => {
      return value !== '' && value !== undefined && value !== null;
    });
  }

  static countActiveFilters(filters: EnhancedSearchFilters): number {
    return Object.entries(filters).filter(([key, value]) => {
      return value !== '' && value !== undefined && value !== null;
    }).length;
  }
} 