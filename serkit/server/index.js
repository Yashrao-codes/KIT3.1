const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
const port = process.env.PORT || 3001;

// Enable CORS for all origins
app.use(cors({ origin: '*' }));

// Parse JSON bodies
app.use(express.json());

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

    const title = $('title').text();
    const text = $('body').text().trim();
    const images = $('img').map((i, el) => $(el).attr('src')).get();

    res.json({ title, text, images });
  } catch (error) {
    console.error('Error extracting content:', error.message);
    res.status(500).json({ error: 'Failed to extract content', details: error.message });
  }
});

app.post('/api/label', (req, res) => {
  const { text } = req.body;
  if (!text) {
    return res.status(400).json({ error: 'Text is required' });
  }

  const words = text.split(' ');
  let label;

  if (words.length > 500) label = 'Long Article';
  else if (words.length > 200) label = 'Medium Article';
  else label = 'Short Article';

  res.json({ label });
});

// Catch-all handler for any request that doesn't match the ones above
app.use((req, res) => {
  res.status(404).json({ error: 'Not found' });
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});