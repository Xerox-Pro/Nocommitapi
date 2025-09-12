import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) youtube = await Innertube.create();

    const query = req.query.q;
    if (!query) return res.status(400).json({ error: "Missing search query" });

    const limit = parseInt(req.query.limit) || 50;

    let searchResult = await youtube.search(query, { type: "video" });
    let results = searchResult.videos ? Array.from(searchResult.videos) : [];

    while (results.length < limit && searchResult.has_continuation) {
      searchResult = await searchResult.getContinuation();
      results = results.concat(searchResult.videos || []);
    }

    // 加工せずそのまま返す
    res.json(results.slice(0, limit));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
