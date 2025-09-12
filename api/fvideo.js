// api/trending.js
import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) {
      youtube = await Innertube.create({
        lang: "ja", // 日本語表示
        location: "JP" // 日本向け
      });
    }

    // トレンド取得
    const mtrending = await youtube.getTrending("music");

    // そのまま返す
    res.status(200).json(mtrending);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
