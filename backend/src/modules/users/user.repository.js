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
