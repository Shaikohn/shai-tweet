import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/config/database.js';

async function registerUser(user) {
  return request(app).post('/api/auth/register').send(user);
}

async function loginUser(creds) {
  return request(app).post('/api/auth/login').send(creds);
}

async function createAuthenticatedUser(overrides = {}) {
  const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
  const userPayload = {
    email: `user+${unique}@example.com`,
    password: 'Password123!',
    username: `user_${unique}`,
    displayName: 'Test User',
    ...overrides,
  };

  const regRes = await registerUser(userPayload);
  expect(regRes.status).toBe(201);
  const registered = regRes.body.user;

  const loginRes = await loginUser({ email: userPayload.email, password: userPayload.password });
  expect(loginRes.status).toBe(200);
  const token = loginRes.body.token;

  return { user: registered, token };
}

async function createTweet(token, content) {
  return request(app).post('/api/tweets').set('Authorization', `Bearer ${token}`).send({ content });
}

describe('POST/DELETE /api/tweets/:id/like - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('allows an authenticated user to like a tweet', async () => {
    const liker = await createAuthenticatedUser();
    const author = await createAuthenticatedUser();

    const tRes = await createTweet(author.token, 'A tweet to like');
    expect(tRes.status).toBe(201);
    const tweet = tRes.body.tweet;

    const res = await request(app).post(`/api/tweets/${tweet.id}/like`).set('Authorization', `Bearer ${liker.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'Tweet liked successfully');

    const db = await pool.query('SELECT user_id, tweet_id FROM likes WHERE user_id = $1 AND tweet_id = $2', [liker.user.id, tweet.id]);
    expect(db.rows.length).toBe(1);
    expect(db.rows[0].user_id).toBe(liker.user.id);
    expect(db.rows[0].tweet_id).toBe(tweet.id);
  });

  it('rejects duplicate like', async () => {
    const liker = await createAuthenticatedUser();
    const author = await createAuthenticatedUser();

    const tRes = await createTweet(author.token, 'Duplicate like test');
    expect(tRes.status).toBe(201);
    const tweet = tRes.body.tweet;

    const first = await request(app).post(`/api/tweets/${tweet.id}/like`).set('Authorization', `Bearer ${liker.token}`);
    expect(first.status).toBe(200);

    const second = await request(app).post(`/api/tweets/${tweet.id}/like`).set('Authorization', `Bearer ${liker.token}`);
    expect(second.status).toBe(409);
    expect(second.body).toHaveProperty('message', 'Tweet already liked');
  });

  it('allows a user to unlike a tweet', async () => {
    const liker = await createAuthenticatedUser();
    const author = await createAuthenticatedUser();

    const tRes = await createTweet(author.token, 'Unlike test');
    expect(tRes.status).toBe(201);
    const tweet = tRes.body.tweet;

    const likeRes = await request(app).post(`/api/tweets/${tweet.id}/like`).set('Authorization', `Bearer ${liker.token}`);
    expect(likeRes.status).toBe(200);

    const unlikeRes = await request(app).delete(`/api/tweets/${tweet.id}/like`).set('Authorization', `Bearer ${liker.token}`);
    expect(unlikeRes.status).toBe(200);
    expect(unlikeRes.body).toHaveProperty('message', 'Tweet unliked successfully');

    const db = await pool.query('SELECT user_id, tweet_id FROM likes WHERE user_id = $1 AND tweet_id = $2', [liker.user.id, tweet.id]);
    expect(db.rows.length).toBe(0);
  });

  it('returns 404 when unliking a tweet that was not liked', async () => {
    const liker = await createAuthenticatedUser();
    const author = await createAuthenticatedUser();

    const tRes = await createTweet(author.token, 'Not liked tweet');
    expect(tRes.status).toBe(201);
    const tweet = tRes.body.tweet;

    const res = await request(app).delete(`/api/tweets/${tweet.id}/like`).set('Authorization', `Bearer ${liker.token}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Like not found');
  });

  it('returns 404 for non-existing tweet id', async () => {
    const liker = await createAuthenticatedUser();

    const res = await request(app).post('/api/tweets/00000000-0000-0000-0000-000000000000/like').set('Authorization', `Bearer ${liker.token}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('returns 404 for invalid tweet id format', async () => {
    const liker = await createAuthenticatedUser();

    const res = await request(app).post('/api/tweets/not-a-valid-id/like').set('Authorization', `Bearer ${liker.token}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('rejects unauthenticated like request', async () => {
    const liker = await createAuthenticatedUser();

    const tRes = await createTweet(liker.token, 'Auth test');
    expect(tRes.status).toBe(201);
    const tweet = tRes.body.tweet;

    const res = await request(app).post(`/api/tweets/${tweet.id}/like`);
    expect(res.status).toBe(401);
  });
});
