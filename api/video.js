import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) youtube = await Innertube.create();

    const qid = req.query.id;
    if (!qid) return res.status(400).json({ error: "Missing video id" });

    const info = await youtube.getInfo(qid);

    // 関連動画を最大20件に制限
    let related = [];
    if (Array.isArray(info.related_videos)) {
      related = info.related_videos.slice(0, 20).map(v => ({
        videoId: v.id,
        title: v.title,
        author: v.author?.name,
        view_count: v.view_count
      }));
    } else if (Array.isArray(info.watch_next_feed)) {
      related = info.watch_next_feed.slice(0, 20).map(v => ({
        videoId: v.id,
        title: v.title,
        author: v.author?.name,
        view_count: v.view_count
      }));
    }

    const responseData = {
      channelName: info.secondary_info?.owner?.author?.name || null,
      channelId: info.secondary_info?.owner?.author?.id || null,
      title: info.primary_info?.title?.text || null,
      viewCount: info.primary_info?.view_count?.text || null,
      likeCount: info.basic_info?.like_count || null,
      description: info.secondary_info?.description?.text || null,
      relatedVideos: related
    };

    res.status(200).json(responseData);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
