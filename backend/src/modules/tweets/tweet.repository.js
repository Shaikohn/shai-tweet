import pool from '../../config/database.js';

export async function createTweet({ userId, content }) {
  const insert = await pool.query(
    `INSERT INTO tweets (user_id, content, image_url, parent_tweet_id)
     VALUES ($1, $2, NULL, NULL)
     RETURNING id`,
    [userId, content]
  );

  const id = insert.rows[0].id;

  const result = await pool.query(
    `SELECT t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id,
            COUNT(l.user_id) AS likes_count
     FROM tweets t
     LEFT JOIN likes l ON l.tweet_id = t.id
     WHERE t.id = $1
     GROUP BY t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id`,
    [id]
  );

  return result.rows[0];
}

export async function createReply({ userId, content, parentTweetId }) {
  const insert = await pool.query(
    `INSERT INTO tweets (user_id, content, image_url, parent_tweet_id)
     VALUES ($1, $2, NULL, $3)
     RETURNING id`,
    [userId, content, parentTweetId]
  );

  const id = insert.rows[0].id;

  const result = await pool.query(
    `SELECT t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id,
            COUNT(l.user_id) AS likes_count
     FROM tweets t
     LEFT JOIN likes l ON l.tweet_id = t.id
     WHERE t.id = $1
     GROUP BY t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id`,
    [id]
  );

  return result.rows[0];
}

export async function findRepliesByParentId(parentTweetId) {
  const result = await pool.query(
    `SELECT t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id, u.username,
            COUNT(l.user_id) AS likes_count
     FROM tweets t
     LEFT JOIN likes l ON l.tweet_id = t.id
     JOIN users u ON u.id = t.user_id
     WHERE t.parent_tweet_id = $1 AND t.deleted_at IS NULL
     GROUP BY t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id, u.username
     ORDER BY t.created_at ASC, t.id ASC`,
    [parentTweetId]
  );

  return result.rows;
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
