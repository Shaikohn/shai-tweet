import * as repo from './feed.repository.js';

export async function getFeedForUser(userId) {
  const rows = await repo.findFeedTweetsByUserId(userId);

  const tweets = rows.map((row) => ({
    id: row.id,
    content: row.content,
    imageUrl: row.image_url ?? null,
    parentTweetId: row.parent_tweet_id ?? null,
    createdAt: row.created_at ? (row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()) : null,
    likesCount: Number(row.likes_count ?? 0),
    author: { id: row.user_id, username: row.username },
  }));

  return tweets;
}
