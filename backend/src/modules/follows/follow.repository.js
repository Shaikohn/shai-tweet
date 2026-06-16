import pool from '../../config/database.js';

export async function findUserByUsernameLower(username) {
  if (!username) return null;
  const result = await pool.query(
    'SELECT id, username FROM users WHERE LOWER(username) = $1',
    [username.toLowerCase()]
  );
  return result.rows[0];
}

export async function findFollow(followerId, followingId) {
  const result = await pool.query(
    'SELECT follower_id, following_id FROM follows WHERE follower_id = $1 AND following_id = $2',
    [followerId, followingId]
  );
  return result.rows[0];
}

export async function createFollow(followerId, followingId) {
  const result = await pool.query(
    'INSERT INTO follows (follower_id, following_id) VALUES ($1, $2) RETURNING follower_id, following_id, created_at',
    [followerId, followingId]
  );
  return result.rows[0];
}

export async function deleteFollow(followerId, followingId) {
  const result = await pool.query(
    'DELETE FROM follows WHERE follower_id = $1 AND following_id = $2 RETURNING follower_id, following_id',
    [followerId, followingId]
  );
  return result.rows[0];
}
