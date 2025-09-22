import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) {
      youtube = await Innertube.create({ lang: "ja", location: "JP" });
    }

    const id = req.query.id;
    const page = parseInt(req.query.page || "1");
    const perPage = 150; // 1ページあたりの件数

    if (!id) {
      return res.status(400).json({ error: "Missing channel id" });
    }

    // チャンネル情報を取得
    const channel = await youtube.getChannel(id);

    // 動画一覧を取得
    let videosFeed = await channel.getVideos({ limit: perPage });

    // ページ送り処理
    for (let i = 1; i < page; i++) {
      if (videosFeed.hasNext()) {
        videosFeed = await videosFeed.next();
      } else {
        videosFeed = { videos: [] };
        break;
      }
    }

    // レスポンスを返す
    res.status(200).json({
      channel: {
        id: channel.id,
        name: channel.metadata?.title || channel.name || null,
        description: channel.metadata?.description || null,
        avatar: channel.metadata?.avatar || null, // アイコン
        banner: channel.metadata?.banner || null, // ヘッダー
        subscriberCount: channel.subscriber_count || null // 登録者数
      },
      page,
      videos: videosFeed.videos || []
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
