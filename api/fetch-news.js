// /api/fetch-news.js
import Parser from 'rss-parser';
const parser = new Parser();

const RSS_FEEDS = {
  global: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'http://rss.cnn.com/rss/edition.rss',
    'https://www.aljazeera.com/xml/rss/all.xml'
  ],
  za: [
    'https://rss.enca.com/rss/enca/top_stories',
    'https://www.news24.com/rss'
  ],
  us: [
    'http://rss.cnn.com/rss/edition_us.rss',
    'https://rss.nytimes.com/services/xml/rss/nyt/HomePage.xml'
  ],
  tech: [
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://www.theverge.com/rss/index.xml'
  ],
  health: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://www.medicalnewstoday.com/rss'
  ],
  politics: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Politics.xml',
    'https://feeds.bbci.co.uk/news/politics/rss.xml'
  ],
  war: [
    'https://www.aljazeera.com/xml/rss/all.xml'
  ],
  business: [
    'https://feeds.bbci.co.uk/news/business/rss.xml'
  ],
  education: [
    'https://rss.sciencedaily.com/education_learning.xml'
  ],
  environment: [
    'https://www.theguardian.com/environment/rss'
  ],
  ai: [
    'https://spectrum.ieee.org/rss/ai'
  ],
  governance: [
    'https://www.un.org/rss'
  ]
};

export default async function handler(req, res) {
  const { country = 'global', topic = '' } = req.query;

  try {
    const countryFeeds = RSS_FEEDS[country] || [];
    const topicFeeds = topic && RSS_FEEDS[topic] ? RSS_FEEDS[topic] : [];

    const feeds = [...countryFeeds, ...topicFeeds];
    if (feeds.length === 0) feeds.push(...RSS_FEEDS.global);

    let allArticles = [];

    for (const feed of feeds) {
      try {
        const parsed = await parser.parseURL(feed);
        allArticles.push(...parsed.items.slice(0, 2));
      } catch (innerErr) {
        console.error(`⛔ Failed to parse feed: ${feed}`, innerErr.message);
      }
    }

    const articles = allArticles.slice(0, 7).map(item => ({
      title: item.title,
      url: item.link,
      description: item.contentSnippet || item.content || 'No summary.'
    }));

    console.log("✅ Mirror Intel Response:", articles.length);
    res.status(200).json({ articles });
  } catch (err) {
    console.error("❌ Server Error in fetch-news.js:", err.message);
    res.status(500).json({ error: 'A server error occurred while fetching news.' });
  }
}

