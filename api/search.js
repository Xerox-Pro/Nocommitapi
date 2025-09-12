// api/search.js
import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) youtube = await Innertube.create({ lang: "ja" });

    const { q, type, upload, feature, duration } = req.query;

    if (!q) return res.status(400).json({ error: "Missing search query" });

    // --- 通常検索 ---
    let search = await youtube.search(q);

    // --- フィルターマップ ---
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
    if (type) {
      const typeCategory = search.filters.get("Type");
      if (typeCategory && typeCategory.get(typeMap[type])) {
        search = await typeCategory.get(typeMap[type]).select();
      }
    }

    // --- Upload date フィルター ---
    if (upload) {
      const uploadCategory = search.filters.get("Upload date");
      if (uploadCategory && uploadCategory.get(uploadMap[upload])) {
        search = await uploadCategory.get(uploadMap[upload]).select();
      }
    }

    // --- Duration フィルター ---
    if (duration) {
      const durationCategory = search.filters.get("Duration");
      if (durationCategory && durationCategory.get(durationMap[duration])) {
        search = await durationCategory.get(durationMap[duration]).select();
      }
    }

    // --- Features フィルター ---
    if (feature) {
      const featureCategory = search.filters.get("Features");
      if (featureCategory && featureCategory.get(featureMap[feature])) {
        search = await featureCategory.get(featureMap[feature]).select();
      }
    }

    // --- 生のレスポンスを返す ---
    return res.status(200).json(search);

  } catch (err) {
    console.error("❌ Error in search:", err);
    return res.status(500).json({ error: err.message });
  }
}
