import { Innertube } from "youtubei.js";

let youtube;

export default async function handler(req, res) {
  try {
    if (!youtube) youtube = await Innertube.create();

    const id = req.query.id;
    if (!id) return res.status(400).json({ error: "Missing video id" });

    const limit = 300;

    let comments = await youtube.getComments(id);
    let allComments = comments.contents ? Array.from(comments.contents) : [];

    // continuation があるか安全に確認
    while (
      allComments.length < limit &&
      typeof comments.getContinuation === "function" &&
      comments.has_continuation
    ) {
      const next = await comments.getContinuation();
      allComments = allComments.concat(next.contents || []);
      comments = next; // ← 次のページを更新
    }

    res.json({
      comments: allComments.slice(0, limit).map(c => ({
        text: c.comment?.content?.text ?? c.comment?.content ?? null,
        comment_id: c.comment?.comment_id ?? null,
        published_time: c.comment?.published_time ?? null,
        author: {
          id: c.comment?.author?.id ?? null,
          name: c.comment?.author?.name ?? null,
          thumbnails: c.comment?.author?.thumbnails?.map(t => t.url) ?? [],
          is_member: c.comment?.author?.is_member ?? false,
          member_badge: c.comment?.member_badge?.url ?? null
        },
        like_count: c.comment?.like_count ?? 0,
        reply_count: c.comment?.reply_count ?? 0,
        is_pinned: c.comment?.is_pinned ?? false
      }))
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
