// /api/fetch-news.js
const Parser = require('rss-parser');
const parser = new Parser();

const RSS_FEEDS = {
  global: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'https://rss.cnn.com/rss/edition.rss',
    'https://www.aljazeera.com/xml/rss/all.xml'
  ],
  us: [
    'https://rss.cnn.com/rss/edition_us.rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'
  ],
  za: [
    'https://rss.enca.com/rss/enca/top_stories',
    'https://www.news24.com/rss'
  ],
  health: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://www.medicalnewstoday.com/rss'
  ],
  tech: [
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://www.theverge.com/rss/index.xml'
  ],
  business: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Business.xml',
    'https://feeds.bbci.co.uk/news/business/rss.xml'
  ],
  politics: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://feeds.bbci.co.uk/news/politics/rss.xml'
  ],
  war: [
    'https://www.aljazeera.com/xml/rss/all.xml'
  ],
  environment: [
    'https://www.theguardian.com/environment/rss',
    'https://rss.sciencedaily.com/earth_climate.xml'
  ],
  education: [
    'https://www.timeshighereducation.com/news/rss',
    'https://rss.sciencedaily.com/education_learning.xml'
  ],
  ai: [
    'https://spectrum.ieee.org/rss/ai',
    'https://www.technologyreview.com/feed/'
  ],
  governance: [
    'https://www.un.org/rss'
  ]
};

module.exports = async (req, res) => {
  const { country = 'global', topic } = req.query;

  const feedsFromCountry = RSS_FEEDS[country] || [];
  const feedsFromTopic = topic && RSS_FEEDS[topic] ? RSS_FEEDS[topic] : [];

  const feedsToUse = [...feedsFromCountry, ...feedsFromTopic];
  if (feedsToUse.length === 0) feedsToUse.push(...RSS_FEEDS.global);

  try {
    let allArticles = [];

    for (const feed of feedsToUse) {
      try {
        const parsed = await parser.parseURL(feed);
        allArticles.push(...parsed.items.slice(0, 2));
      } catch (err) {
        console.warn(`⚠️ Failed to parse: ${feed}`, err.message);
      }
    }

    const trimmed = allArticles.slice(0, 7).map(item => ({
      title: item.title,
      url: item.link,
      description: item.contentSnippet || item.content || 'No summary.'
    }));

    res.status(200).json({ articles: trimmed });
  } catch (err) {
    console.error('🛑 Server Error:', err.message);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
};
