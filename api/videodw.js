import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) {
      youtube = await Innertube.create();
    }

    const videoId = req.query.id;
    if (!videoId) {
      return res.status(400).json({ error: "Missing video id" });
    }

    const info = await youtube.getInfo(videoId);

    // streaming_dataからフォーマット情報を取得
    const formats = info.streaming_data?.formats || [];
    const adaptiveFormats = info.streaming_data?.adaptive_formats || [];

    // 高品質なMP4 (ビデオ+オーディオ結合済み) を探す
    const highQualityMp4 = formats
      .filter(f => f.mime_type.startsWith('video/mp4') && f.has_audio)
      .sort((a, b) => (b.height || 0) - (a.height || 0)) // 解像度で降順ソート
      [0]; // 最も高品質なものを選択

    // 高品質なオーディオ (webm/opus or mp4/aac) を探す
    // YouTubeはWAVを直接提供しないため、利用可能な最高ビットレートのオーディオを選択
    const highQualityAudio = adaptiveFormats
      .filter(f => f.mime_type.startsWith('audio/'))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0)) // ビットレートで降順ソート
      [0]; // 最も高品質なものを選択

    res.status(200).json({
      mp4: highQualityMp4 || null,
      audio: highQualityAudio || null,
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
