import React, { useState, useEffect } from 'react';
import { X, Save } from 'lucide-react';
import { UserPreferences } from '../types';
import { CATEGORIES, SOURCES } from '../config/api';
import apiService from '../services/api.service';

interface PreferencesModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onSave: (preferences: UserPreferences) => void;
}

const PreferencesModal: React.FC<PreferencesModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onSave
}) => {
  const [selectedSources, setSelectedSources] = useState<string[]>(preferences.sources);
  const [selectedCategories, setSelectedCategories] = useState<string[]>(preferences.categories);
  const [selectedAuthors, setSelectedAuthors] = useState<string[]>(preferences.authors);
  const [availableAuthors, setAvailableAuthors] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && availableAuthors.length === 0) {
      loadAvailableAuthors();
    }
  }, [isOpen]);

  const loadAvailableAuthors = async () => {
    setLoading(true);
    try {
      // Fetch recent articles to get available authors
      const articles = await apiService.fetchArticles({}, ['newsapi', 'guardian', 'nytimes']);
      const validAuthors = articles
        .map(article => article.author)
        .filter((author): author is string => 
          typeof author === 'string' && 
          author !== null && 
          author !== undefined && 
          author.trim() !== ''
        );
      const authors = Array.from(new Set(validAuthors)).sort();
      setAvailableAuthors(authors);
    } catch (error) {
      console.error('Error loading authors:', error);
      setAvailableAuthors([]);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const handleSourceToggle = (sourceId: string) => {
    setSelectedSources(prev =>
      prev.includes(sourceId)
        ? prev.filter(id => id !== sourceId)
        : [...prev, sourceId]
    );
  };

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategories(prev =>
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleAuthorToggle = (author: string) => {
    setSelectedAuthors(prev =>
      prev.includes(author)
        ? prev.filter(name => name !== author)
        : [...prev, author]
    );
  };

  const handleSave = () => {
    onSave({
      sources: selectedSources,
      categories: selectedCategories,
      authors: selectedAuthors
    });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Customize Your News Feed</h2>
          <button onClick={onClose} className="modal-close-btn">
            <X size={24} />
          </button>
        </div>

        <div className="modal-body">
          <div className="preferences-section">
            <h3>News Sources</h3>
            <p className="preferences-description">
              Select your preferred news sources. Leave empty to use all sources.
            </p>
            <div className="checkbox-group">
              {SOURCES.map(source => (
                <label key={source.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedSources.includes(source.id)}
                    onChange={() => handleSourceToggle(source.id)}
                  />
                  <span>{source.displayName}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="preferences-section">
            <h3>Categories</h3>
            <p className="preferences-description">
              Choose the topics you're interested in. Leave empty to see all categories.
            </p>
            <div className="checkbox-group">
              {CATEGORIES.map(category => (
                <label key={category.id} className="checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedCategories.includes(category.id)}
                    onChange={() => handleCategoryToggle(category.id)}
                  />
                  <span>{category.displayName}</span>
                </label>
              ))}
            </div>
          </div>

          <div className="preferences-section">
            <h3>Preferred Authors</h3>
            <p className="preferences-description">
              Select authors you want to follow. Leave empty to see all authors.
            </p>
            {loading ? (
              <p>Loading authors...</p>
            ) : (
              <div className="checkbox-group" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                {availableAuthors.length > 0 ? (
                  availableAuthors.map(author => (
                    <label key={author} className="checkbox-label">
                      <input
                        type="checkbox"
                        checked={selectedAuthors.includes(author)}
                        onChange={() => handleAuthorToggle(author)}
                      />
                      <span>{author}</span>
                    </label>
                  ))
                ) : (
                  <p>No authors available. Try fetching some articles first.</p>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="modal-footer">
          <button onClick={onClose} className="btn-secondary">
            Cancel
          </button>
          <button onClick={handleSave} className="btn-primary">
            <Save size={18} />
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};

export default PreferencesModal; 