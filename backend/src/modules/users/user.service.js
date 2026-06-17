import * as repo from './user.repository.js';

export async function getUserTweets(username, page = 1, limit = 20) {
  const user = await repo.findByUsernameLower(username);
  if (!user) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const offset = (Math.max(Number(page) || 1, 1) - 1) * (Number(limit) || 20);
  const fetchLimit = Number(limit) + 1;

  const rows = await repo.findTweetsByUserId(user.id, fetchLimit, offset);

  const hasMore = rows.length > limit;
  const sliced = hasMore ? rows.slice(0, limit) : rows;

  const tweets = sliced.map((row) => ({
    id: row.id,
    content: row.content,
    imageUrl: row.image_url ?? null,
    parentTweetId: row.parent_tweet_id ?? null,
    createdAt: row.created_at ? (row.created_at instanceof Date ? row.created_at.toISOString() : new Date(row.created_at).toISOString()) : null,
    likesCount: Number(row.likes_count ?? 0),
    author: { id: user.id, username: user.username },
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

export async function searchUsers(q) {
  if (typeof q !== 'string' || q.trim().length === 0) {
    const err = new Error('Search query is required');
    err.status = 400;
    throw err;
  }

  const normalized = q.trim().toLowerCase();
  const rows = await repo.findUsersByQuery(normalized);

  const users = rows.map((row) => ({
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio ?? null,
    avatarUrl: row.avatar_url ?? null,
  }));

  return users;
}

export async function getUserProfile(username, currentUserId = null) {
  const row = await repo.findUserProfileByUsername(username, currentUserId);
  if (!row) {
    const err = new Error('User not found');
    err.status = 404;
    throw err;
  }

  const user = {
    id: row.id,
    username: row.username,
    displayName: row.display_name,
    bio: row.bio ?? null,
    avatarUrl: row.avatar_url ?? null,
    followersCount: Number(row.followers_count ?? 0),
    followingCount: Number(row.following_count ?? 0),
    tweetsCount: Number(row.tweets_count ?? 0),
    followedByCurrentUser: Boolean(row.followed_by_current_user ?? false),
  };

  return user;
}
