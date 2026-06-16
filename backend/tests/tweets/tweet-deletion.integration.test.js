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

describe('DELETE /api/tweets/:id - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('allows the author to delete their tweet', async () => {
    const { token } = await createAuthenticatedUser();

    const createRes = await createTweet(token, 'My deletable tweet');
    expect(createRes.status).toBe(201);
    const tweet = createRes.body.tweet;

    const delRes = await request(app).delete(`/api/tweets/${tweet.id}`).set('Authorization', `Bearer ${token}`);
    expect(delRes.status).toBe(200);
    expect(delRes.body).toHaveProperty('message', 'Tweet deleted successfully');

    const db = await pool.query('SELECT deleted_at FROM tweets WHERE id = $1', [tweet.id]);
    expect(db.rows.length).toBe(1);
    expect(db.rows[0].deleted_at).toBeTruthy();
  });

  it('returns 404 when deleting an already deleted tweet', async () => {
    const { token } = await createAuthenticatedUser();

    const createRes = await createTweet(token, 'Already deleted test');
    expect(createRes.status).toBe(201);
    const tweet = createRes.body.tweet;

    const first = await request(app).delete(`/api/tweets/${tweet.id}`).set('Authorization', `Bearer ${token}`);
    expect(first.status).toBe(200);

    const second = await request(app).delete(`/api/tweets/${tweet.id}`).set('Authorization', `Bearer ${token}`);
    expect(second.status).toBe(404);
    expect(second.body).toHaveProperty('message', 'Tweet not found');
  });

  it('rejects deletion by another user', async () => {
    const { token: tokenA } = await createAuthenticatedUser();
    const { token: tokenB } = await createAuthenticatedUser();

    const createRes = await createTweet(tokenA, 'User A tweet');
    expect(createRes.status).toBe(201);
    const tweet = createRes.body.tweet;

    const delRes = await request(app).delete(`/api/tweets/${tweet.id}`).set('Authorization', `Bearer ${tokenB}`);
    expect(delRes.status).toBe(403);
    expect(delRes.body).toHaveProperty('message', 'Forbidden');

    const db = await pool.query('SELECT deleted_at FROM tweets WHERE id = $1', [tweet.id]);
    expect(db.rows.length).toBe(1);
    expect(db.rows[0].deleted_at).toBeNull();
  });

  it('returns 404 for a non-existing tweet id', async () => {
    const { token } = await createAuthenticatedUser();

    const res = await request(app).delete('/api/tweets/00000000-0000-0000-0000-000000000000').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('rejects unauthenticated deletion', async () => {
    const { token } = await createAuthenticatedUser();
    const createRes = await createTweet(token, 'Unauth test');
    expect(createRes.status).toBe(201);
    const tweet = createRes.body.tweet;

    const res = await request(app).delete(`/api/tweets/${tweet.id}`);
    expect(res.status).toBe(401);
  });
});
