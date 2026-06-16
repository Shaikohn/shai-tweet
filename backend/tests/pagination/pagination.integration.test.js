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

async function createReply(token, parentId, content) {
  return request(app).post(`/api/tweets/${parentId}/replies`).set('Authorization', `Bearer ${token}`).send({ content });
}

describe('Pagination integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('GET /api/feed?page=1&limit=2 returns limit items and hasMore true when more rows exist', async () => {
    const { user, token } = await createAuthenticatedUser();

    const r1 = await createTweet(token, 'Feed tweet 1');
    expect(r1.status).toBe(201);
    const r2 = await createTweet(token, 'Feed tweet 2');
    expect(r2.status).toBe(201);
    const r3 = await createTweet(token, 'Feed tweet 3');
    expect(r3.status).toBe(201);

    const res = await request(app).get('/api/feed?page=1&limit=2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 2);
    expect(res.body.pagination).toHaveProperty('hasMore', true);
  });

  it('GET /api/feed returns hasMore false on last page', async () => {
    const { token } = await createAuthenticatedUser();

    await createTweet(token, 'P1');
    await createTweet(token, 'P2');
    const p3 = await createTweet(token, 'P3');
    expect(p3.status).toBe(201);

    const res = await request(app).get('/api/feed?page=2&limit=2').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(1);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty('page', 2);
    expect(res.body.pagination).toHaveProperty('limit', 2);
    expect(res.body.pagination).toHaveProperty('hasMore', false);
  });

  it('GET /api/users/:username/tweets?page=1&limit=2 returns limit items and pagination object', async () => {
    const { user, token } = await createAuthenticatedUser();

    await createTweet(token, 'U1');
    await createTweet(token, 'U2');
    await createTweet(token, 'U3');

    const res = await request(app).get(`/api/users/${user.username}/tweets?page=1&limit=2`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 2);
    expect(res.body.pagination).toHaveProperty('hasMore', true);
  });

  it('GET /api/tweets/:id/replies?page=1&limit=2 returns limit items and pagination object', async () => {
    const author = await createAuthenticatedUser();
    const replier = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent for replies');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const r1 = await createReply(replier.token, parent.id, 'Reply 1');
    expect(r1.status).toBe(201);
    const r2 = await createReply(replier.token, parent.id, 'Reply 2');
    expect(r2.status).toBe(201);
    const r3 = await createReply(replier.token, parent.id, 'Reply 3');
    expect(r3.status).toBe(201);

    const res = await request(app).get(`/api/tweets/${parent.id}/replies?page=1&limit=2`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(2);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 2);
    expect(res.body.pagination).toHaveProperty('hasMore', true);
  });

  it('invalid page and limit fallback to page 1 and limit 20', async () => {
    const { token } = await createAuthenticatedUser();
    const t = await createTweet(token, 'Single');
    expect(t.status).toBe(201);

    const res = await request(app).get('/api/feed?page=not-a-number&limit=NaN').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty('page', 1);
    expect(res.body.pagination).toHaveProperty('limit', 20);
  });

  it('limit greater than 50 is capped at 50', async () => {
    const { token } = await createAuthenticatedUser();
    const single = await createTweet(token, 'One tweet');
    expect(single.status).toBe(201);

    const res = await request(app).get('/api/feed?limit=100').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(res.body.pagination).toBeDefined();
    expect(res.body.pagination).toHaveProperty('limit', 50);
    expect(res.body.pagination).toHaveProperty('page', 1);
  });
});
