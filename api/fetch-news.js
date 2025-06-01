// /api/fetch-news.js – Mirror Intel via RSS Feeds
import Parser from 'rss-parser';
const parser = new Parser();

export default async function handler(req, res) {
  const feeds = [
    'https://feeds.bbci.co.uk/news/world/rss.xml',
    'http://rss.cnn.com/rss/edition.rss',
    'https://rss.dw.com/rdf/rss-en-all.xml',
    'https://www.aljazeera.com/xml/rss/all.xml'
  ];

  let allArticles = [];

  try {
    for (const feed of feeds) {
      const result = await parser.parseURL(feed);
      allArticles.push(...result.items.slice(0, 2)); // 2 from each
    }

    const trimmed = allArticles.slice(0, 5).map((item, i) => ({
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
