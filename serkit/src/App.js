import React, { useState, useEffect } from 'react';
import Login from './components/Login';
import ArticleManager from './components/ArticleManager';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const deviceId = localStorage.getItem('deviceId');
    if (deviceId) {
      setIsLoggedIn(true);
    }
  }, []);

  return (
    <div className="App">
      <h1>Welcome to SerKIT</h1>
      <Login isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      {isLoggedIn && <ArticleManager />}
    </div>
  );
}

export default App;
