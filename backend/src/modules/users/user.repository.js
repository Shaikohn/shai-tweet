import pool from '../../config/database.js';

export async function findByUsernameLower(username) {
  if (!username) return null;
  const result = await pool.query(
    'SELECT id, username FROM users WHERE LOWER(username) = $1',
    [username.trim().toLowerCase()]
  );
  return result.rows[0];
}

export async function findTweetsByUserId(userId) {
  const result = await pool.query(
    `SELECT t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, COUNT(l.user_id) AS likes_count
     FROM tweets t
     LEFT JOIN likes l ON l.tweet_id = t.id
     WHERE t.user_id = $1 AND t.deleted_at IS NULL
     GROUP BY t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at
     ORDER BY t.created_at DESC, t.id DESC`,
    [userId]
  );

  return result.rows;
}

export async function findFollowersByUserId(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.display_name, u.bio, u.avatar_url
     FROM follows f
     JOIN users u ON u.id = f.follower_id
     WHERE f.following_id = $1
     ORDER BY u.username ASC`,
    [userId]
  );

  return result.rows;
}

export async function findFollowingByUserId(userId) {
  const result = await pool.query(
    `SELECT u.id, u.username, u.display_name, u.bio, u.avatar_url
     FROM follows f
     JOIN users u ON u.id = f.following_id
     WHERE f.follower_id = $1
     ORDER BY u.username ASC`,
    [userId]
  );

  return result.rows;
}
