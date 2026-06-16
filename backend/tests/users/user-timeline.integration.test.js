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

async function deleteTweet(token, tweetId) {
  return request(app).delete(`/api/tweets/${tweetId}`).set('Authorization', `Bearer ${token}`);
}

describe('GET /api/users/:username/tweets - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('returns tweets for an existing user ordered by newest first', async () => {
    const { user, token } = await createAuthenticatedUser();

    const r1 = await createTweet(token, 'First tweet');
    expect(r1.status).toBe(201);
    const tweet1 = r1.body.tweet;

    const r2 = await createTweet(token, 'Second tweet');
    expect(r2.status).toBe(201);
    const tweet2 = r2.body.tweet;

    const res = await request(app).get(`/api/users/${user.username}/tweets`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(2);

    const [first, second] = res.body.tweets;
    expect(first.id).toBe(tweet2.id);
    expect(second.id).toBe(tweet1.id);

    for (const t of res.body.tweets) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('content');
      expect(t).toHaveProperty('imageUrl');
      expect(t).toHaveProperty('parentTweetId');
      expect(t).toHaveProperty('createdAt');
      expect(t).toHaveProperty('author');
      expect(t.author).toHaveProperty('username', user.username);
    }
  });

  it('returns an empty array when the user exists but has no tweets', async () => {
    const { user } = await createAuthenticatedUser();
    const res = await request(app).get(`/api/users/${user.username}/tweets`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(0);
  });

  it('returns 404 when the user does not exist', async () => {
    const res = await request(app).get('/api/users/unknownuser/tweets');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('does not return soft-deleted tweets', async () => {
    const { user, token } = await createAuthenticatedUser();

    const a = await createTweet(token, 'Tweet A');
    expect(a.status).toBe(201);
    const tweetA = a.body.tweet;

    const b = await createTweet(token, 'Tweet B');
    expect(b.status).toBe(201);
    const tweetB = b.body.tweet;

    const del = await deleteTweet(token, tweetB.id);
    expect(del.status).toBe(200);

    const res = await request(app).get(`/api/users/${user.username}/tweets`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(1);
    expect(res.body.tweets[0].id).toBe(tweetA.id);
  });
});
