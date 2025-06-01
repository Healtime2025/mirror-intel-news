// /api/fetch-news.js
import Parser from 'rss-parser';
const parser = new Parser();

const RSS_FEEDS = {
  global: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'http://rss.cnn.com/rss/edition.rss',
    'https://www.aljazeera.com/xml/rss/all.xml'
  ],
  us: [
    'http://rss.cnn.com/rss/edition_us.rss',
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
    'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml'
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
    'https://rss.sciencedaily.com/education_learning.xml'
  ],
  ai: [
    'https://www.technologyreview.com/feed/',
    'https://spectrum.ieee.org/rss/ai'
  ],
  governance: [
    'https://www.un.org/rss',
    'https://www.gov.uk/government/publications.atom'
  ]
};

export default async function handler(req, res) {
  try {
    const { country = 'global', topic = '' } = req.query;

    console.log("🧭 Received query:", { country, topic });

    const feedsFromCountry = RSS_FEEDS[country] || [];
    const feedsFromTopic = topic && RSS_FEEDS[topic] ? RSS_FEEDS[topic] : [];

    const feedsToUse = [...feedsFromCountry, ...feedsFromTopic];
    if (feedsToUse.length === 0) {
      return res.status(400).json({ error: "No feeds found for selected country or topic." });
    }

    let allArticles = [];

    for (const feed of feedsToUse) {
      try {
        const parsed = await parser.parseURL(feed);
        allArticles.push(...parsed.items.slice(0, 2));
      } catch (feedError) {
        console.warn(`⚠️ Skipped broken feed: ${feed}`, feedError.message);
      }
    }

    const trimmed = allArticles.slice(0, 7).map(item => ({
      title: item.title,
      url: item.link,
      description: item.contentSnippet || item.content || 'No summary.'
    }));

    res.status(200).json({ articles: trimmed });
  } catch (err) {
    console.error("🛑 Global fetch error:", err.message);
    res.status(500).json({ error: "Server failed to fetch feeds." });
  }
}
