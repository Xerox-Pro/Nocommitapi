import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) {
      youtube = await Innertube.create({ lang: "ja", location: "JP" });
    }

    const id = req.query.id;
    const page = parseInt(req.query.page || "1");
    const perPage = 150;

    if (!id) {
      return res.status(400).json({ error: "Missing channel id" });
    }

    // チャンネル情報と動画一覧
    const channel = await youtube.getChannel(id);
    let videosFeed = await channel.getVideos({ limit: perPage });

    for (let i = 1; i < page; i++) {
      if (videosFeed.hasNext()) {
        videosFeed = await videosFeed.next();
      } else {
        videosFeed = { videos: [] };
        break;
      }
    }

    // 登録者数を補完：最初の動画から取得
    let subscriberCount = channel.subscriber_count || null;
    if (!subscriberCount && videosFeed.videos.length > 0) {
      try {
        const firstVideoId = videosFeed.videos[0].id;
        const videoInfo = await youtube.getInfo(firstVideoId);
        subscriberCount =
          videoInfo?.basic_info?.author?.subscriber_count ||
          videoInfo?.author?.subscriber_count ||
          null;
      } catch (e) {
        console.warn("Could not fetch subscriber count from video:", e.message);
      }
    }

    res.status(200).json({
      channel: {
        id: channel.id,
        name: channel.metadata?.title || channel.name || null,
        description: channel.metadata?.description || null,
        avatar: channel.metadata?.avatar || null,
        banner: channel.metadata?.banner || null,
        subscriberCount
      },
      page,
      videos: videosFeed.videos || []
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
