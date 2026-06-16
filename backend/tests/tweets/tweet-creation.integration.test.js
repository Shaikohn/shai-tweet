import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/config/database.js';

async function registerUser(user) {
  const res = await request(app).post('/api/auth/register').send(user);
  return res;
}

async function loginUser(creds) {
  const res = await request(app).post('/api/auth/login').send(creds);
  return res;
}

describe('POST /api/tweets - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('creates a tweet with valid content', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const userPayload = {
      email: `tweet+${unique}@example.com`,
      password: 'Password123!',
      username: `tweetuser_${unique}`,
      displayName: 'Tweet User',
    };

    const registerRes = await registerUser(userPayload);
    expect(registerRes.status).toBe(201);
    const registered = registerRes.body.user;

    const loginRes = await loginUser({ email: userPayload.email, password: userPayload.password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;
    expect(token).toBeTruthy();

    const content = 'My first ShaiTweet';

    const res = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content });

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('tweet');
    const tweet = res.body.tweet;
    expect(tweet).toHaveProperty('id');
    expect(tweet.content).toBe(content);
    expect(tweet.imageUrl).toBeNull();
    expect(tweet.parentTweetId).toBeNull();
    expect(typeof tweet.createdAt).toBe('string');
    expect(tweet.author).toBeTruthy();
    expect(tweet.author.username).toBe(registered.username);
    expect(tweet.author.id).toBe(registered.id);

    const db = await pool.query('SELECT id, content, image_url, parent_tweet_id, user_id, created_at FROM tweets WHERE id = $1', [tweet.id]);
    expect(db.rows.length).toBe(1);
    const row = db.rows[0];
    expect(row.content).toBe(content);
    expect(row.image_url).toBeNull();
    expect(row.parent_tweet_id).toBeNull();
    expect(row.user_id).toBe(tweet.author.id);
    expect(row.created_at).toBeTruthy();
  });

  it('rejects unauthenticated requests', async () => {
    const res = await request(app).post('/api/tweets').send({ content: 'Should fail' });
    expect(res.status).toBe(401);
  });

  it('rejects empty content', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const userPayload = {
      email: `tweet2+${unique}@example.com`,
      password: 'Password123!',
      username: `tweetuser2_${unique}`,
      displayName: 'Tweet User 2',
    };

    const registerRes = await registerUser(userPayload);
    expect(registerRes.status).toBe(201);

    const loginRes = await loginUser({ email: userPayload.email, password: userPayload.password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    const res = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
  });

  it('rejects content longer than 280 characters', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const userPayload = {
      email: `tweet3+${unique}@example.com`,
      password: 'Password123!',
      username: `tweetuser3_${unique}`,
      displayName: 'Tweet User 3',
    };

    const registerRes = await registerUser(userPayload);
    expect(registerRes.status).toBe(201);

    const loginRes = await loginUser({ email: userPayload.email, password: userPayload.password });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    const longContent = 'a'.repeat(281);

    const res = await request(app)
      .post('/api/tweets')
      .set('Authorization', `Bearer ${token}`)
      .send({ content: longContent });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
  });
});
