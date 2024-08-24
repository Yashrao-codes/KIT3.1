import React, { useState, useEffect } from 'react';
import './ArticleManager.css';

const ArticleManager = () => {
  const [articles, setArticles] = useState([]);
  const [newArticleUrl, setNewArticleUrl] = useState('');

  useEffect(() => {
    const savedArticles = JSON.parse(localStorage.getItem('articles') || '[]');
    setArticles(savedArticles);
  }, []);

  const saveArticle = (e) => {
    e.preventDefault();
    if (newArticleUrl) {
      const updatedArticles = [...articles, { url: newArticleUrl, id: Date.now(), title: 'New Article' }];
      setArticles(updatedArticles);
      localStorage.setItem('articles', JSON.stringify(updatedArticles));
      setNewArticleUrl('');
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
              <h3>{article.title || 'Untitled Article'}</h3>
              <p>{article.url}</p>
            </a>
            <button onClick={() => removeArticle(article.id)} className="remove-button">Remove</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ArticleManager;
