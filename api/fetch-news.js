import Parser from 'rss-parser';
const parser = new Parser();

const RSS_FEEDS = {
  global: [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'http://rss.cnn.com/rss/edition.rss',
    'https://rss.dw.com/rdf/rss-en-all.xml',
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
  tech: [
    'https://feeds.bbci.co.uk/news/technology/rss.xml',
    'https://www.theverge.com/rss/index.xml',
    'https://rss.nytimes.com/services/xml/rss/nyt/Technology.xml'
  ],
  health: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://www.medicalnewstoday.com/rss'
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
    'https://www.aljazeera.com/xml/rss/all.xml',
    'https://rss.dw.com/rdf/rss-en-all.xml'
  ],
  ai: [
    'https://www.technologyreview.com/feed/',
    'https://spectrum.ieee.org/rss/ai'
  ],
  education: [
    'https://www.timeshighereducation.com/news/rss',
    'https://rss.sciencedaily.com/education_learning.xml'
  ],
  governance: [
    'https://www.gov.uk/government/publications.atom',
    'https://www.un.org/rss'
  ],
  environment: [
    'https://www.theguardian.com/environment/rss',
    'https://rss.sciencedaily.com/earth_climate.xml'
  ]
};

export default async function handler(req, res) {
  const { country = 'global', topic } = req.query;

  const feedsFromCountry = RSS_FEEDS[country] || [];
  const feedsFromTopic = topic && RSS_FEEDS[topic] ? RSS_FEEDS[topic] : [];

  const feedsToUse = [...feedsFromCountry, ...feedsFromTopic];
  if (feedsToUse.length === 0) feedsToUse.push(...RSS_FEEDS.global);

  let allArticles = [];

  try {
    for (const feed of feedsToUse) {
      const result = await parser.parseURL(feed);
      allArticles.push(...result.items.slice(0, 2)); // Limit for performance
    }

    const trimmed = allArticles.slice(0, 7).map(item => ({
      title: item.title,
      url: item.link,
      description: item.contentSnippet || item.content || 'No summary.'
    }));

    console.log("🧠 Mirror Intel RSS Response:", trimmed);
    res.status(200).json({ articles: trimmed });
  } catch (err) {
    console.error("🛑 RSS fetch failed:", err.message);
    res.status(500).json({ error: 'Failed to fetch RSS feeds' });
  }
}
