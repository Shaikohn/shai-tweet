import * as repo from './feed.repository.js';

export async function getFeedForUser(userId, page = 1, limit = 20) {
  const offset = (Math.max(Number(page) || 1, 1) - 1) * (Number(limit) || 20);
  const fetchLimit = Number(limit) + 1;

  const rows = await repo.findFeedTweetsByUserId(userId, fetchLimit, offset);

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;

  const tweets = sliced.map((row) => ({
    id: row.id,
    content: row.content,
    imageUrl: row.image_url ?? null,
    parentTweetId: row.parent_tweet_id ?? null,
    createdAt: row.created_at ? (row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()) : null,
    likesCount: Number(row.likes_count ?? 0),
    likedByCurrentUser: Boolean(row.liked_by_current_user),
    author: { id: row.user_id, username: row.username },
  }));

  return {
    tweets,
    pagination: {
      page: Number(page) || 1,
      limit: Number(limit) || 20,
      hasMore: Boolean(hasMore),
    },
  };
}
