import pool from '../../config/database.js';

export async function findByUsernameLower(username) {
  if (!username) return null;
  const result = await pool.query(
    'SELECT id, username FROM users WHERE LOWER(username) = $1',
    [username.trim().toLowerCase()]
  );
  return result.rows[0];
}

export async function findUserProfileByUsername(username, currentUserId = null) {
  if (!username) return null;
  // If currentUserId is provided, compute whether the current user follows this profile.
  const result = await pool.query(
    `SELECT u.id, u.username, u.display_name, u.bio, u.avatar_url,
            (SELECT COUNT(*) FROM follows f WHERE f.following_id = u.id) AS followers_count,
            (SELECT COUNT(*) FROM follows f2 WHERE f2.follower_id = u.id) AS following_count,
            (SELECT COUNT(*) FROM tweets t WHERE t.user_id = u.id AND t.deleted_at IS NULL) AS tweets_count,
            ($2::uuid IS NOT NULL AND EXISTS (SELECT 1 FROM follows f3 WHERE f3.follower_id = $2::uuid AND f3.following_id = u.id)) AS followed_by_current_user
     FROM users u
     WHERE LOWER(u.username) = $1`,
    [username.trim().toLowerCase(), currentUserId]
  );

  return result.rows[0];
}

export async function findTweetsByUserId(userId, limit, offset, currentUserId = null) {
  const result = await pool.query(
    `SELECT t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id, u.username,
            COUNT(l.user_id) AS likes_count,
            ($2::uuid IS NOT NULL AND EXISTS (SELECT 1 FROM likes current_like WHERE current_like.tweet_id = t.id AND current_like.user_id = $2::uuid)) AS liked_by_current_user
     FROM tweets t
     JOIN users u ON u.id = t.user_id
     LEFT JOIN likes l ON l.tweet_id = t.id
     WHERE t.user_id = $1 AND t.deleted_at IS NULL
     GROUP BY t.id, t.content, t.image_url, t.parent_tweet_id, t.created_at, t.user_id, u.username
     ORDER BY t.created_at DESC, t.id DESC
     LIMIT $3 OFFSET $4`,
    [userId, currentUserId, limit, offset]
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

export async function findUsersByQuery(query) {
  const q = (query || '').trim().toLowerCase();
  const pattern = `%${q}%`;
  const result = await pool.query(
    `SELECT id, username, display_name, bio, avatar_url
     FROM users
     WHERE LOWER(username) LIKE $1 OR LOWER(display_name) LIKE $1
     ORDER BY username ASC
     LIMIT 10`,
    [pattern]
  );

  return result.rows;
}
