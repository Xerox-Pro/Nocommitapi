import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) {
      youtube = await Innertube.create({ lang: "ja", location: "JP" });
    }

    const id = req.query.id;
    const page = parseInt(req.query.page || "1"); // デフォルト1ページ目
    const perPage = 100; // 1ページあたり50件

    if (!id) return res.status(400).json({ error: "Missing channel id" });

    const channel = await youtube.getChannel(id);

    let videosFeed = await channel.getVideos({ limit: perPage });
    // pageが1より大きい場合、next()を繰り返す
    for (let i = 1; i < page; i++) {
      if (videosFeed.hasNext()) {
        videosFeed = await videosFeed.next();
      } else {
        videosFeed = { videos: [] }; // もうページなし
        break;
      }
    }

    res.status(200).json({
      page,
      videos: videosFeed.videos || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
