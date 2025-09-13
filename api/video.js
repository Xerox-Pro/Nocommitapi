import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) youtube = await Innertube.create();

    const qid = req.query.id;
    if (!qid) return res.status(400).json({ error: "Missing video id" });

    const info = await youtube.getInfo(qid);

    // 関連動画を最大20件に制限
    if (Array.isArray(info.related_videos)) {
      info.related_videos = info.related_videos.slice(0, 50);
    }
    if (Array.isArray(info.watch_next_feed)) {
      info.watch_next_feed = info.watch_next_feed.slice(0, 20);
    }
    if (info.secondary_info?.watch_next_feed) {
      info.secondary_info.watch_next_feed = info.secondary_info.watch_next_feed.slice(0, 20);
    }

    res.status(200).json(info);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
