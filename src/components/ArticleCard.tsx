import React from 'react';
import { Clock, User, ExternalLink } from 'lucide-react';
import { Article } from '../types';
import { format } from 'date-fns';
import LazyImage from './LazyImage';

interface ArticleCardProps {
  article: Article;
}

const ArticleCard: React.FC<ArticleCardProps> = ({ article }) => {
  const formattedDate = format(new Date(article.publishedAt), 'MMM dd, yyyy');

  return (
    <article className="article-card">
      {article.urlToImage && (
        <div className="article-image-container">
          <LazyImage
            src={article.urlToImage}
            alt={article.title}
            className="article-image"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </div>
      )}
      
      <div className="article-content">
        <div className="article-meta">
          <span className="article-source">{article.source.name}</span>
          {article.category && (
            <span className="article-category">{article.category}</span>
          )}
        </div>

        <h3 className="article-title">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            className="article-link"
          >
            {article.title}
            <ExternalLink size={16} className="external-link-icon" />
          </a>
        </h3>

        {article.description && (
          <p className="article-description">{article.description}</p>
        )}

        <div className="article-footer">
          <div className="article-info">
            {article.author && (
              <span className="article-author">
                <User size={14} />
                {article.author}
              </span>
            )}
            <span className="article-date">
              <Clock size={14} />
              {formattedDate}
            </span>
          </div>
        </div>
      </div>
    </article>
  );
};

export default ArticleCard; 