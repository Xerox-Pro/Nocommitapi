import { Innertube } from "youtubei.js";

let youtubeWithProxy;

// youtubei.jsが使用するfetchを上書きするカスタム関数
const customFetch = async (url, options) => {
  // Vercelが自動で提供する環境変数から、デプロイ先のURLを取得
  // ローカル環境(vercel dev)の場合は localhost:3000 を想定
  const baseUrl = process.env.VERCEL_URL 
    ? `https://${process.env.VERCEL_URL}` 
    : 'http://localhost:8080';
  
  const targetUrl = typeof url === 'string' ? url : url.toString();
  
  // 我々のプロキシエンドポイントのURLを構築
  const proxyUrl = new URL(`${baseUrl}/api/proxy`);
  proxyUrl.searchParams.set('url', targetUrl);

  // 元のリクエスト情報（ヘッダーやボディ）をそのままプロキシに渡す
  const response = await fetch(proxyUrl, {
    method: options.method,
    headers: options.headers,
    body: options.body,
    // duplexはEdge Runtimeでストリーミングボディを扱う際に必要
    ...(options.body ? { duplex: 'half' } : {}),
  });

  return response;
};


export default async function handler(req, res) {
  try {
    // カスタムfetch関数を使ってInnertubeインスタンスを初期化
    if (!youtubeWithProxy) {
      youtubeWithProxy = await Innertube.create({ 
        fetch: customFetch 
      });
    }

    const videoId = req.query.id;
    if (!videoId) {
      return res.status(400).json({ error: "Missing video id" });
    }

    // このgetInfoは内部的にcustomFetchを呼び出し、我々のプロキシを経由する
    const info = await youtubeWithProxy.getInfo(videoId);

    const formats = info.streaming_data?.formats || [];
    const adaptiveFormats = info.streaming_data?.adaptive_formats || [];

    const highQualityMp4 = formats
      .filter(f => f.mime_type.startsWith('video/mp4') && f.has_audio)
      .sort((a, b) => (b.height || 0) - (a.height || 0))
      [0];

    const highQualityAudio = adaptiveFormats
      .filter(f => f.mime_type.startsWith('audio/'))
      .sort((a, b) => (b.bitrate || 0) - (a.bitrate || 0))
      [0];

    res.status(200).json({
      mp4: highQualityMp4 || null,
      audio: highQualityAudio || null,
    });

  } catch (err) {
    console.error("Error in videodw via proxy:", err);
    res.status(500).json({ 
      error: "An error occurred while fetching video data through the proxy.",
      message: err.message 
    });
  }
}
