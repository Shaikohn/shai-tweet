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
    `SELECT id, content, image_url, parent_tweet_id, created_at
     FROM tweets
     WHERE user_id = $1 AND deleted_at IS NULL
     ORDER BY created_at DESC`,
    [userId]
  );

  return result.rows;
}
