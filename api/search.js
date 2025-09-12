// api/search.js
import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) youtube = await Innertube.create({ lang: "ja" });

    const { q, type, upload, feature, duration } = req.query;

    if (!q) return res.status(400).json({ error: "Missing search query" });

    // 通常検索
    let search = await youtube.search(q);

    // --- フィルター マップ ---
    const typeMap = { video: "Video", channel: "Channel", playlist: "Playlist" };
    const uploadMap = {
      "last-hour": "Last hour",
      today: "Today",
      week: "This week",
      month: "This month",
      year: "This year"
    };
    const durationMap = { short: "Short (<4 min)", long: "Long (>20 min)" };
    const featureMap = {
      hd: "HD",
      subtitles: "Subtitles/CC",
      creative: "Creative Commons",
      live: "Live",
      "360": "360°",
      "4k": "4K",
      hdr: "HDR",
      vr180: "VR180",
      location: "Location",
      purchased: "Purchased"
    };

    // --- Type フィルター ---
    if (type && search.filters.get("Type")?.get(typeMap[type])) {
      search = await search.filters.get("Type").get(typeMap[type]).select();
    }

    // --- Upload date フィルター ---
    if (upload && search.filters.get("Upload date")?.get(uploadMap[upload])) {
      search = await search.filters.get("Upload date").get(uploadMap[upload]).select();
    }

    // --- Duration フィルター ---
    if (duration && search.filters.get("Duration")?.get(durationMap[duration])) {
      search = await search.filters.get("Duration").get(durationMap[duration]).select();
    }

    // --- Features フィルター ---
    if (feature && search.filters.get("Features")?.get(featureMap[feature])) {
      search = await search.filters.get("Features").get(featureMap[feature]).select();
    }

    // 生のレスポンスを返す
    return res.status(200).json(search);

  } catch (err) {
    console.error("❌ Error in search:", err);
    return res.status(500).json({ error: err.message });
  }
}
