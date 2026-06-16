import * as repo from './user.repository.js';

export async function getUserTweets(username) {
  const user = await repo.findByUsernameLower(username);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const rows = await repo.findTweetsByUserId(user.id);

  const tweets = rows.map((row) => ({
    id: row.id,
    content: row.content,
    imageUrl: row.image_url ?? null,
    parentTweetId: row.parent_tweet_id ?? null,
    createdAt: row.created_at ? (row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()) : null,
    likesCount: Number(row.likes_count ?? 0),
    author: { id: user.id, username: user.username },
  }));

  return tweets;
}

export async function getFollowers(username) {
  const user = await repo.findByUsernameLower(username);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const rows = await repo.findFollowersByUserId(user.id);
  const followers = rows.map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio ?? null,
    avatarUrl: row.avatar_url ?? null,
  }));

  return followers;
}

export async function getFollowing(username) {
  const user = await repo.findByUsernameLower(username);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const rows = await repo.findFollowingByUserId(user.id);
  const following = rows.map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio ?? null,
    avatarUrl: row.avatar_url ?? null,
  }));

  return following;
}
