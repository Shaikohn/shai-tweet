import pool from '../../config/database.js';

export async function findFeedTweetsByUserId(userId) {
  const result = await pool.query(
    `SELECT t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id, u.username
     FROM tweets t
     JOIN users u ON u.id = t.user_id
     WHERE t.deleted_at IS NULL
       AND (t.user_id = $1 OR t.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1))
     ORDER BY t.created_at DESC`,
    [userId]
  );

  return result.rows;
}
