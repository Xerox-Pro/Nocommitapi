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
    const basicInfo = await channel.getBasicInfo(); // 補助的に情報を取得

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
        name: basicInfo?.metadata?.title || channel.name || null,
        description: basicInfo?.metadata?.description || null,
        avatar: basicInfo?.metadata?.avatar || null,  // アイコン
        banner: basicInfo?.metadata?.banner || null,  // ヘッダー
        subscriberCount:
          basicInfo?.subscriber_count || channel.subscriber_count || null
      },
      page,
      videos: videosFeed.videos || []
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
