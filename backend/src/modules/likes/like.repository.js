import pool from '../../config/database.js';

export async function findLike(userId, tweetId) {
  const result = await pool.query(
    'SELECT user_id, tweet_id FROM likes WHERE user_id = $1 AND tweet_id = $2',
    [userId, tweetId]
  );
  return result.rows[0];
}

export async function createLike(userId, tweetId) {
  const result = await pool.query(
    'INSERT INTO likes (user_id, tweet_id) VALUES ($1, $2) RETURNING user_id, tweet_id, created_at',
    [userId, tweetId]
  );
  return result.rows[0];
}

export async function deleteLike(userId, tweetId) {
  const result = await pool.query(
    'DELETE FROM likes WHERE user_id = $1 AND tweet_id = $2 RETURNING user_id, tweet_id',
    [userId, tweetId]
  );
  return result.rows[0];
}
