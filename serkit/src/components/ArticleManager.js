import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './ArticleManager.css';

const API_URL = process.env.REACT_APP_API_URL;

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [newArticleUrl, setNewArticleUrl] = useState('');
  const [error, setError] = useState(null);

  useEffect(() => {
    const savedArticles = JSON.parse(localStorage.getItem('articles') || '[]');
    setArticles(savedArticles);
  }, []);

  const extractContent = async (url) => {
    try {
      console.log('Sending request to:', `${API_URL}/api/extract`);
      const response = await axios.post(`${API_URL}/api/extract`, { url });
      console.log('Extract response:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error extracting content:', error);
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      } else if (error.request) {
        console.error('No response received:', error.request);
      } else {
        console.error('Error message:', error.message);
      }
      setError('Failed to extract content. Please try again.');
      return null;
    }
  };

  const getAILabel = async (text) => {
    try {
      const response = await axios.post(`${API_URL}/api/label`, { text });
      console.log('Label response:', response.data);
      return response.data.label;
    } catch (error) {
      console.error('Error getting AI label:', error);
      return 'Unlabeled';
    }
  };

  const saveArticle = async (e) => {
    e.preventDefault();
    setError(null);
    if (newArticleUrl) {
      const content = await extractContent(newArticleUrl);
      if (content) {
        const label = await getAILabel(content.text);
        const newArticle = {
          url: newArticleUrl,
          id: Date.now(),
          title: content.title,
          text: content.text.substring(0, 200) + '...', // Store a preview
          images: content.images.slice(0, 5), // Store up to 5 images
          label: label,
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
              <h3>{article.title}</h3>
              <p>{article.text}</p>
              {article.images && article.images.length > 0 && (
                <img src={article.images[0]} alt="Article preview" className="article-image" />
              )}
            </a>
            <p className="article-label">AI Label: {article.label}</p>
            <button onClick={() => removeArticle(article.id)} className="remove-button">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleManager;
