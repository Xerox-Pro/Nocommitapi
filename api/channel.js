import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) {
      youtube = await Innertube.create({ lang: "ja", location: "JP" });
    }

    const id = req.query.id;
    const page = parseInt(req.query.page || "1"); 
    const perPage = 50; // 無難に50件にしておく（100でも可）

    if (!id) {
      return res.status(400).json({ error: "Missing channel id" });
    }

    // チャンネル情報を取得
    const channel = await youtube.getChannel(id);

    // 動画一覧を取得
    let videosFeed = await channel.getVideos({ limit: perPage });

    // ページ送り
    for (let i = 1; i < page; i++) {
      if (videosFeed.hasNext()) {
        videosFeed = await videosFeed.next();
      } else {
        videosFeed = { videos: [] };
        break;
      }
    }

    // まとめて返す
    res.status(200).json({
      channel: {
        id: channel.id,
        name: channel.metadata?.title || null,
        description: channel.metadata?.description || null,
        avatar: channel.metadata?.avatar || null, // アイコン
        banner: channel.metadata?.banner || null, // ヘッダー
        subscriberCount: channel.metadata?.subscriber_count || null
      },
      page,
      videos: videosFeed.videos || []
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
