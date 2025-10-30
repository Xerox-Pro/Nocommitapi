// /api/proxy.js

export const config = {
  runtime: 'edge',
};

export default async function handler(req) {
  // CORSプリフライトリクエストの処理
  if (req.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': '*',
      },
    });
  }

  const url = new URL(req.url);
  const targetUrl = url.searchParams.get('url');

  const commonHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Content-Type': 'application/json',
  };

  if (!targetUrl) {
    return new Response(JSON.stringify({ error: 'URL parameter is missing' }), {
      status: 400,
      headers: commonHeaders,
    });
  }

  try {
    // 元のリクエストから必要な情報を引き継ぐ
    const originalHeaders = req.headers;
    const body = req.method === 'POST' ? await req.blob() : null;

    // YouTubeへリクエストを転送
    const response = await fetch(targetUrl, {
      method: req.method,
      headers: {
        'User-Agent': originalHeaders.get('user-agent'),
        'Content-Type': originalHeaders.get('content-type'),
        'Accept': originalHeaders.get('accept'),
        'Accept-Language': originalHeaders.get('accept-language'),
        // youtubei.jsが必要とするその他のヘッダーも追加
        'X-YouTube-Client-Name': originalHeaders.get('x-youtube-client-name'),
        'X-YouTube-Client-Version': originalHeaders.get('x-youtube-client-version'),
      },
      body,
    });
    
    // レスポンスをそのままクライアント（videodw.js）へ返す
    const responseBody = await response.blob();
    return new Response(responseBody, {
      status: response.status,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Content-Type': response.headers.get('Content-Type') || 'application/octet-stream',
      },
    });

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
    return new Response(JSON.stringify({ error: `Proxy error: ${errorMessage}` }), {
      status: 500,
      headers: commonHeaders,
    });
  }
}
