import pool from '../../config/database.js';

export async function findByEmail(email) {
  const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
  return result.rows[0];
}

export async function findByUsername(username) {
  const result = await pool.query('SELECT * FROM users WHERE username = $1', [username]);
  return result.rows[0];
}

export async function createUser({ email, passwordHash, username, displayName }) {
  const result = await pool.query(
    `INSERT INTO users (email, password_hash, username, display_name)
     VALUES ($1, $2, $3, $4)
     RETURNING id, email, username, display_name, bio, avatar_url, created_at`,
    [email, passwordHash, username, displayName]
  );

  return result.rows[0];
}

export async function findById(id) {
  const result = await pool.query(
    `SELECT id, email, username, display_name, bio, avatar_url, created_at
     FROM users
     WHERE id = $1`,
    [id]
  );

  return result.rows[0];
}
