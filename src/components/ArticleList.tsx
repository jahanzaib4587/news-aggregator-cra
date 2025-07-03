import React, { useEffect, useRef } from 'react';
import { Article } from '../types';
import ArticleCard from './ArticleCard';
import SkeletonCard from './SkeletonCard';
import { Loader2, Search, Filter, RefreshCw, TrendingUp, Globe, Calendar } from 'lucide-react';

interface ArticleListProps {
  articles: Article[];
  loading?: boolean;
  error?: string | null;
  hasMore?: boolean;
  onLoadMore?: () => void;
  showSkeletons?: boolean;
}

const ArticleList: React.FC<ArticleListProps> = ({ 
  articles, 
  loading, 
  error, 
  hasMore = false,
  onLoadMore,
  showSkeletons = false
}) => {
  const loadMoreRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!onLoadMore || !hasMore || loading) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          onLoadMore();
        }
      },
      { threshold: 0.1 }
    );

    if (loadMoreRef.current) {
      observer.observe(loadMoreRef.current);
    }

    return () => observer.disconnect();
  }, [onLoadMore, hasMore, loading]);

  if (loading && articles.length === 0) {
    return (
      <div className="articles-grid">
        {Array.from({ length: 6 }).map((_, index) => {
          const variants = ['default', 'compact', 'wide'] as const;
          const variant = variants[index % variants.length];
          return (
            <SkeletonCard key={`skeleton-${index}`} variant={variant} />
          );
        })}
      </div>
    );
  }

  if (error && articles.length === 0) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-content">
          <div className="empty-state-icon error">
            <RefreshCw size={48} />
          </div>
          <h3 className="empty-state-title">Oops! Something went wrong</h3>
          <p className="empty-state-description">
            {error}
          </p>
          <button className="empty-state-button" onClick={() => window.location.reload()}>
            <RefreshCw size={18} />
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (articles.length === 0 && !loading) {
    return (
      <div className="empty-state-container">
        <div className="empty-state-content">
          <div className="empty-state-icon">
            <Search size={48} />
          </div>
          <h3 className="empty-state-title">No articles found</h3>
          <p className="empty-state-description">
            We couldn't find any articles matching your criteria. Try adjusting your search or preferences.
          </p>
          
          <div className="empty-state-suggestions">
            <h4>Try these suggestions:</h4>
            <div className="suggestion-cards">
              <div className="suggestion-card">
                <Filter size={20} />
                <span>Adjust your filters</span>
              </div>
              <div className="suggestion-card">
                <TrendingUp size={20} />
                <span>Browse trending topics</span>
              </div>
              <div className="suggestion-card">
                <Globe size={20} />
                <span>Try different sources</span>
              </div>
              <div className="suggestion-card">
                <Calendar size={20} />
                <span>Change date range</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="articles-grid">
        {articles.map((article) => (
          <ArticleCard key={article.id} article={article} />
        ))}
        
        {showSkeletons && loading && (
          <>
            {Array.from({ length: 3 }).map((_, index) => {
              const variants = ['default', 'compact', 'wide'] as const;
              const variant = variants[index % variants.length];
              return (
                <SkeletonCard key={`loading-skeleton-${index}`} variant={variant} />
              );
            })}
          </>
        )}
      </div>

      {hasMore && (
        <div ref={loadMoreRef} className="load-more-trigger">
          {loading && (
            <div className="loading-more">
              <Loader2 className="loading-spinner" size={24} />
              <span>Loading more articles...</span>
            </div>
          )}
        </div>
      )}

      {error && articles.length > 0 && (
        <div className="error-container">
          <p className="error-message">Error loading more articles: {error}</p>
        </div>
      )}
    </div>
  );
};

export default ArticleList; 