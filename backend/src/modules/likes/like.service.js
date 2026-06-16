import * as repo from './like.repository.js';
import * as tweetRepo from '../tweets/tweet.repository.js';

const uuidRegex =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

function isValidUuid(value) {
  return typeof value === 'string' && uuidRegex.test(value);
}

export async function likeTweet(tweetId, user) {
  if (!isValidUuid(tweetId)) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const tweet = await tweetRepo.findTweetById(tweetId);
  if (!tweet || tweet.deleted_at) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const existing = await repo.findLike(user.id, tweetId);
  if (existing) {
    const err = new Error('Tweet already liked');
    err.status = 409;
    throw err;
  }

  await repo.createLike(user.id, tweetId);
  return;
}

export async function unlikeTweet(tweetId, user) {
  if (!isValidUuid(tweetId)) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }
  const tweet = await tweetRepo.findTweetById(tweetId);
  if (!tweet || tweet.deleted_at) {
    const err = new Error('Tweet not found');
    err.status = 404;
    throw err;
  }

  const existing = await repo.findLike(user.id, tweetId);
  if (!existing) {
    const err = new Error('Like not found');
    err.status = 404;
    throw err;
  }

  await repo.deleteLike(user.id, tweetId);
  return;
}
