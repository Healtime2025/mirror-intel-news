export default async function handler(req, res) {
  const apiKey = "1f59afb2e91949b2b63dcbe7ce834151";

  // Get 'country' from query params
  const { country } = req.query;

  // Build dynamic URL
  const base = "https://newsapi.org/v2/top-headlines";
  const url = country
    ? `${base}?country=${country}&pageSize=5&apiKey=${apiKey}`
    : `${base}?pageSize=5&apiKey=${apiKey}`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    console.log("🧠 Mirror Intel Raw News Response:", data);

    res.status(200).json({ articles: data.articles || [] });
  } catch (error) {
    console.error("Mirror Intel fetch failed:", error);
    res.status(500).json({ error: "Failed to fetch news" });
  }
}
