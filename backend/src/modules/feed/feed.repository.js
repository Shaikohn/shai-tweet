import pool from '../../config/database.js';

export async function findFeedTweetsByUserId(userId, limit, offset) {
  const result = await pool.query(
    `SELECT t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id, u.username,
            COUNT(l.user_id) AS likes_count,
            (
              SELECT COUNT(*) FROM tweets replies
              WHERE replies.parent_tweet_id = t.id
                AND replies.deleted_at IS NULL
            ) AS replies_count,
            EXISTS (
              SELECT 1 FROM likes current_like
              WHERE current_like.tweet_id = t.id
                AND current_like.user_id = $1
            ) AS liked_by_current_user
     FROM tweets t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN likes l ON l.tweet_id = t.id
     WHERE t.deleted_at IS NULL
       AND t.parent_tweet_id IS NULL
       AND (t.user_id = $1 OR t.user_id IN (SELECT following_id FROM follows WHERE follower_id = $1))
     GROUP BY t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id, u.username
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT $2 OFFSET $3`,
    [userId, limit, offset]
  );

  return result.rows;
}
