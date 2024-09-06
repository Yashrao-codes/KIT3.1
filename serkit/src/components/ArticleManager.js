import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArticleManager.css';

const API_URL = process.env.REACT_APP_API_URL;

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [newArticleUrl, setNewArticleUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    try {
      const savedArticles = JSON.parse(localStorage.getItem('articles') || '[]');
      // Filter out any malformed articles
      const validArticles = savedArticles.filter(article => 
        article && typeof article === 'object' && 'id' in article
      );
      setArticles(validArticles);
    } catch (e) {
      console.error('Error loading saved articles:', e);
      setArticles([]);
    }
  }, []);

  const extractContent = async (url) => {
    try {
      const response = await axios.post(`${API_URL}/api/extract`, { url });
      return response.data;
    } catch (error) {
      console.error('Error extracting content:', error);
      setError('Failed to extract content. Please try again.');
      return null;
    }
  };

  const getAILabel = async (text) => {
    try {
      const response = await axios.post(`${API_URL}/api/label`, { text });
      return response.data;
    } catch (error) {
      console.error('Error getting AI label:', error);
      return { lengthLabel: 'Unlabeled', topicLabels: [] };
    }
  };

  const saveArticle = async (e) => {
    e.preventDefault();
    setError(null);
    if (newArticleUrl) {
      const content = await extractContent(newArticleUrl);
      if (content) {
        const { lengthLabel, topicLabels } = await getAILabel(content.text);
        const newArticle = {
          url: newArticleUrl,
          id: Date.now(),
          title: content.title || 'Untitled',
          text: (content.text || '').substring(0, 200) + '...', // Store a preview
          images: (content.images || []).slice(0, 5), // Store up to 5 images
          lengthLabel: lengthLabel || 'Unknown',
          topicLabels: Array.isArray(topicLabels) ? topicLabels : [],
        };
        const updatedArticles = [...articles, newArticle];
        setArticles(updatedArticles);
        localStorage.setItem('articles', JSON.stringify(updatedArticles));
        setNewArticleUrl('');
      }
    }
  };

  const removeArticle = (id) => {
    const updatedArticles = articles.filter(article => article.id !== id);
    setArticles(updatedArticles);
    localStorage.setItem('articles', JSON.stringify(updatedArticles));
  };

  return (
    <div className="article-manager">
      <h1>SerKIT</h1>
      {error && <p className="error">{error}</p>}
      <form onSubmit={saveArticle} className="add-article-form">
        <input 
          type="text" 
          value={newArticleUrl} 
          onChange={(e) => setNewArticleUrl(e.target.value)}
          placeholder="Add a new article URL"
          className="article-input"
        />
        <button type="submit" className="add-button">Add</button>
      </form>
      <div className="article-list">
        {articles.map(article => (
          <div key={article.id} className="article-card">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="article-link">
              <h3>{article.title || 'Untitled'}</h3>
              <p>{article.text || 'No preview available'}</p>
              {article.images && article.images.length > 0 && (
                <img src={article.images[0]} alt="Article preview" className="article-image" />
              )}
            </a>
            <p className="article-label">Length: {article.lengthLabel || 'Unknown'}</p>
            <p className="article-label">
              Topics: {Array.isArray(article.topicLabels) && article.topicLabels.length > 0 
                ? article.topicLabels.join(', ') 
                : 'No specific topic detected'}
            </p>
            <button onClick={() => removeArticle(article.id)} className="remove-button">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleManager;
