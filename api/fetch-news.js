export default async function handler(req, res) {
  const apiKey = "1f59afb2e91949b2b63dcbe7ce834151";
  const response = await fetch(`https://newsapi.org/v2/top-headlines?country=za&pageSize=5&apiKey=${apiKey}`);
  const data = await response.json();

  res.status(200).json({ articles: data.articles });
}
