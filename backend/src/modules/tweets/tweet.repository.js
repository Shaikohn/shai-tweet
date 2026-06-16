import pool from '../../config/database.js';

export async function createTweet({ userId, content }) {
  const result = await pool.query(
    `INSERT INTO tweets (user_id, content, image_url, parent_tweet_id)
     VALUES ($1, $2, NULL, NULL)
     RETURNING id, content, image_url, parent_tweet_id, created_at, user_id`,
    [userId, content]
  );

  return result.rows[0];
}

export async function findUserById(userId) {
  const result = await pool.query('SELECT id, username FROM users WHERE id = $1', [userId]);
  return result.rows[0];
}

export async function findTweetById(tweetId) {
  const result = await pool.query('SELECT * FROM tweets WHERE id = $1', [tweetId]);
  return result.rows[0];
}

export async function softDeleteTweet(tweetId) {
  const result = await pool.query('UPDATE tweets SET deleted_at = NOW() WHERE id = $1 RETURNING id, deleted_at', [tweetId]);
  return result.rows[0];
}
