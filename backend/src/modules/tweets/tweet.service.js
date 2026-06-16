import * as repo from './tweet.repository.js';

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
    author: author ? { id: author.id, username: author.username } : { id: user.id, username: user.username },
  };

  return tweet;
}
