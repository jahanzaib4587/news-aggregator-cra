import React from 'react';

interface SkeletonCardProps {
  variant?: 'default' | 'compact' | 'wide';
}

const SkeletonCard: React.FC<SkeletonCardProps> = ({ variant = 'default' }) => {
  const getVariantStyles = () => {
    switch (variant) {
      case 'compact':
        return {
          title2Width: '55%',
          desc2Width: '70%',
          desc3Width: '45%'
        };
      case 'wide':
        return {
          title2Width: '85%',
          desc2Width: '95%',
          desc3Width: '75%'
        };
      default:
        return {
          title2Width: '70%',
          desc2Width: '80%',
          desc3Width: '65%'
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <article className="article-card skeleton-card">
      <div className="skeleton-image"></div>
      <div className="article-content">
        <div className="article-meta">
          <div className="skeleton-text skeleton-source"></div>
          <div className="skeleton-text skeleton-category"></div>
        </div>
        
        <div className="skeleton-text skeleton-title"></div>
        <div className="skeleton-text skeleton-title-2" style={{ width: styles.title2Width }}></div>
        
        <div className="skeleton-text skeleton-description"></div>
        <div className="skeleton-text skeleton-description-2" style={{ width: styles.desc2Width }}></div>
        <div className="skeleton-text skeleton-description" style={{ width: styles.desc3Width }}></div>
        
        <div className="article-footer">
          <div className="article-info">
            <div className="skeleton-text skeleton-author"></div>
            <div className="skeleton-text skeleton-date"></div>
          </div>
        </div>
      </div>
    </article>
  );
};

export default SkeletonCard; 