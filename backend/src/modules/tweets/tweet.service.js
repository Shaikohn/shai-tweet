import * as repo from './tweet.repository.js';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value) {
  return typeof value === 'string' && uuidRegex.test(value);
}

export async function createTweet(payload, user) {
  let { content } = payload || {};

  const errors = [];

  if (typeof content !== 'string') {
    errors.push({ field: 'content', message: 'Content is required' });
  } else {
    content = content.trim();
    if (content.length === 0) {
      errors.push({ field: 'content', message: 'Content cannot be empty' });
    }
    if (content.length > 280) {
      errors.push({ field: 'content', message: 'Content must be at most 280 characters' });
    }
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = errors;
    throw err;
  }

  const created = await repo.createTweet({ userId: user.id, content });

  const author = await repo.findUserById(user.id);

  const tweet = {
    id: created.id,
    content: created.content,
    imageUrl: created.image_url ?? null,
    parentTweetId: created.parent_tweet_id ?? null,
    createdAt: created.created_at ? (created.created_at instanceof Date ? created.created_at.toISOString() : new Date(created.created_at).toISOString()) : null,
    likesCount: Number(created.likes_count ?? 0),
    author: author ? { id: author.id, username: author.username } : { id: user.id, username: user.username },
  };

  return tweet;
}

export async function createReply(payload, user, parentTweetId) {
  if (!isValidUuid(parentTweetId)) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const parent = await repo.findTweetById(parentTweetId);
  if (!parent || parent.deleted_at) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  let { content } = payload || {};

  const errors = [];

  if (typeof content !== 'string') {
    errors.push({ field: 'content', message: 'Content is required' });
  } else {
    content = content.trim();
    if (content.length === 0) {
      errors.push({ field: 'content', message: 'Content cannot be empty' });
    }
    if (content.length > 280) {
      errors.push({ field: 'content', message: 'Content must be at most 280 characters' });
    }
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = errors;
    throw err;
  }

  const created = await repo.createReply({ userId: user.id, content, parentTweetId });

  const author = await repo.findUserById(user.id);

  const tweet = {
    id: created.id,
    content: created.content,
    imageUrl: created.image_url ?? null,
    parentTweetId: created.parent_tweet_id ?? null,
    createdAt: created.created_at ? (created.created_at instanceof Date ? created.created_at.toISOString() : new Date(created.created_at).toISOString()) : null,
    likesCount: Number(created.likes_count ?? 0),
    author: author ? { id: author.id, username: author.username } : { id: user.id, username: user.username },
  };

  return tweet;
}

export async function getReplies(parentTweetId, page = 1, limit = 20, currentUserId = null) {
  if (!isValidUuid(parentTweetId)) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const parent = await repo.findTweetById(parentTweetId);
  if (!parent || parent.deleted_at) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const offset = (Math.max(Number(page) || 1, 1) - 1) * (Number(limit) || 20);
  const fetchLimit = Number(limit) + 1;

  const rows = await repo.findRepliesByParentId(parentTweetId, fetchLimit, offset, currentUserId);

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;

  const tweets = sliced.map((row) => ({
    id: row.id,
    content: row.content,
    imageUrl: row.image_url ?? null,
    parentTweetId: row.parent_tweet_id ?? null,
    createdAt: row.created_at ? (row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()) : null,
    likesCount: Number(row.likes_count ?? 0),
    repliesCount: Number(row.replies_count ?? 0),
    author: { id: row.user_id, username: row.username },
    likedByCurrentUser: Boolean(row.liked_by_current_user ?? false),
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

export async function getTweetById(tweetId, currentUserId = null) {
  if (!isValidUuid(tweetId)) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const row = await repo.findTweetWithCountsById(tweetId, currentUserId);
  if (!row) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const tweet = {
    id: row.id,
    content: row.content,
    imageUrl: row.image_url ?? null,
    parentTweetId: row.parent_tweet_id ?? null,
    createdAt: row.created_at ? (row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()) : null,
    likesCount: Number(row.likes_count ?? 0),
    repliesCount: Number(row.replies_count ?? 0),
    likedByCurrentUser: Boolean(row.liked_by_current_user ?? false),
    author: { id: row.user_id, username: row.username },
  };

  return tweet;
}

export async function deleteTweet(tweetId, user) {
  if (!tweetId) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const tweet = await repo.findTweetById(tweetId);
  if (!tweet || tweet.deleted_at) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  if (String(tweet.user_id) !== String(user.id)) {
    const err = new Error('Forbidden');
    err.status = 403;
    throw err;
  }

  await repo.softDeleteTweet(tweetId);
  return;
}
