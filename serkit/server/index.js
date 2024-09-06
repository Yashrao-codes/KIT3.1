const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');
const path = require('path');

const app = express();
const port = process.env.PORT || 3001;

app.use(cors({ origin: '*' }));
app.use(express.json());

// Serve static files from the React app
app.use(express.static(path.join(__dirname, '../build')));

// Helper function to extract main content
function extractMainContent($) {
  // Try to find main content by common selectors
  const selectors = ['article', '.post-content', '.entry-content', '#content', '.content', 'main'];
  for (let selector of selectors) {
    const content = $(selector).first().text().trim();
    if (content) return content;
  }
  // If no main content found, fallback to body text
  return $('body').text().trim();
}

app.post('/api/extract', async (req, res) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    const $ = cheerio.load(response.data);
    
    // Extract title
    const title = $('title').text() || $('h1').first().text() || '';

    // Extract main content
    const text = extractMainContent($);

    // Extract images
    const images = $('img').map((i, el) => $(el).attr('src')).get();

    res.json({ title, text, images });
  } catch (error) {
    console.error('Error extracting content:', error.message);
    res.status(500).json({ error: 'Failed to extract content', details: error.message });
  }
});

// Define categories and their associated keywords
const categories = {
  Technology: ['computer', 'software', 'hardware', 'AI', 'blockchain', 'cybersecurity'],
  Science: ['research', 'experiment', 'study', 'discovery', 'innovation'],
  Health: ['medical', 'wellness', 'fitness', 'nutrition', 'disease'],
  Business: ['finance', 'economy', 'market', 'startup', 'investment'],
  Entertainment: ['movie', 'music', 'celebrity', 'game', 'TV show'],
};

app.post('/api/label', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }
  
  const words = text.split(' ');
  let lengthLabel;
  if (words.length > 500) lengthLabel = 'Long Article';
  else if (words.length > 200) lengthLabel = 'Medium Article';
  else lengthLabel = 'Short Article';

  const lowerCaseText = text.toLowerCase();
  const topicLabels = Object.entries(categories).filter(([category, keywords]) => 
    keywords.some(keyword => lowerCaseText.includes(keyword.toLowerCase()))
  ).map(([category]) => category);

  res.json({ lengthLabel, topicLabels });
});

// The "catchall" handler: for any request that doesn't
// match one above, send back React's index.html file.
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build', 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
