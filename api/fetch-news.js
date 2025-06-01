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
  health: [
    'https://rss.nytimes.com/services/xml/rss/nyt/Health.xml',
    'https://www.medicalnewstoday.com/rss'
  ]
};

export default async function handler(req, res) {
  const { country = 'global', topic } = req.query;

  const feedsFromCountry = RSS_FEEDS[country] || [];
  const feedsFromTopic = topic && RSS_FEEDS[topic] ? RSS_FEEDS[topic] : [];

  const feedsToUse = [...feedsFromCountry, ...feedsFromTopic];
  if (feedsToUse.length === 0) feedsToUse.push(...RSS_FEEDS.global);

  let allArticles = [];

  for (const feed of feedsToUse) {
    try {
      const result = await parser.parseURL(feed);
      allArticles.push(...result.items.slice(0, 2));
    } catch (feedErr) {
      console.warn(`Failed to parse feed: ${feed} → ${feedErr.message}`);
    }
  }

  if (allArticles.length === 0) {
    return res.status(500).json({ error: 'All feeds failed. No news fetched.' });
  }

  const trimmed = allArticles.slice(0, 7).map(item => ({
    title: item.title,
    url: item.link,
    description: item.contentSnippet || item.content || 'No summary.'
  }));

  console.log("🧠 Mirror Intel RSS Response:", trimmed);
  res.status(200).json({ articles: trimmed });
}


