import express from "express";
import channel from "./api/channel.js";
import comments from "./api/comments.js";
import search from "./api/search.js";
import video from "./api/video.js";
import fvideo from "./api/fvideo.js";
import search2 from "./api/search2.js";
import videodw from "./api/videodw.js"; // 追加

const app = express();

// ルート設定
app.get("/api/channel", channel);
app.get("/api/comments", comments);
app.get("/api/search", search);
app.get("/api/video", video);
app.get("/api/fvideo", fvideo);
app.get("/api/search2", search2);
app.get("/api/videodw", videodw); // 追加

// "/" ページでAPI情報を返す、（消しても良い）
app.get("/", (_,res) => {
  res.send(`
    <h2>API情報</h2>
    <h3>検索結果</h3><p>URL:<code>/api/comments?id=&lt;動画ID&gt;</code></p><h3>コメント情報</h3><p>URL:<code>/api/search?q=&lt;検索ワード&gt;&amp;limit=&lt;件数&gt;</code></p><h3>動画情報</h3><p>URL:<code>/api/video?id=&lt;動画ID&gt;</code></p><h3>チャンネル情報</h3><p>URL:<code>/api/channel?id=&lt;チャンネルID&gt;</code></p>
  `);
});

app.listen(8080, () => {
  console.log("サーバーが起動しました。 http://localhost:8080");
});
