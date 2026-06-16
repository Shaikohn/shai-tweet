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

async function followUser(token, username) {
  return request(app).post(`/api/users/${username}/follow`).set('Authorization', `Bearer ${token}`);
}

async function deleteTweet(token, tweetId) {
  return request(app).delete(`/api/tweets/${tweetId}`).set('Authorization', `Bearer ${token}`);
}

describe('GET /api/feed - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it("returns the authenticated user's own tweets", async () => {
    const { user, token } = await createAuthenticatedUser();

    const r1 = await createTweet(token, 'My tweet 1');
    expect(r1.status).toBe(201);
    const t1 = r1.body.tweet;

    const r2 = await createTweet(token, 'My tweet 2');
    expect(r2.status).toBe(201);
    const t2 = r2.body.tweet;

    const res = await request(app).get('/api/feed').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);

    const ids = res.body.tweets.map((t) => t.id);
    expect(ids).toContain(t1.id);
    expect(ids).toContain(t2.id);

    const hit1 = res.body.tweets.find((tt) => tt.id === t1.id);
    const hit2 = res.body.tweets.find((tt) => tt.id === t2.id);
    expect(hit1.author.username).toBe(user.username);
    expect(hit2.author.username).toBe(user.username);

    for (const t of res.body.tweets) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('content');
      expect(t).toHaveProperty('imageUrl');
      expect(t).toHaveProperty('parentTweetId');
      expect(t).toHaveProperty('createdAt');
      expect(t).toHaveProperty('author');
    }
  });

  it('returns tweets from followed users', async () => {
    const follower = await createAuthenticatedUser();
    const target = await createAuthenticatedUser();

    const targetTweetRes = await createTweet(target.token, 'Target tweet');
    expect(targetTweetRes.status).toBe(201);
    const targetTweet = targetTweetRes.body.tweet;

    const followRes = await followUser(follower.token, target.user.username);
    expect(followRes.status).toBe(200);

    const res = await request(app).get('/api/feed').set('Authorization', `Bearer ${follower.token}`);
    expect(res.status).toBe(200);
    const ids = res.body.tweets.map((t) => t.id);
    expect(ids).toContain(targetTweet.id);

    const t = res.body.tweets.find((tt) => tt.id === targetTweet.id);
    expect(t.author.username).toBe(target.user.username);
  });

  it('does not return tweets from users not followed by the authenticated user', async () => {
    const follower = await createAuthenticatedUser();
    const notFollowed = await createAuthenticatedUser();
    const followed = await createAuthenticatedUser();

    const nfRes = await createTweet(notFollowed.token, 'Not followed tweet');
    expect(nfRes.status).toBe(201);
    const nfTweet = nfRes.body.tweet;

    const fRes = await createTweet(followed.token, 'Followed tweet');
    expect(fRes.status).toBe(201);
    const fTweet = fRes.body.tweet;

    await followUser(follower.token, followed.user.username);

    const res = await request(app).get('/api/feed').set('Authorization', `Bearer ${follower.token}`);
    expect(res.status).toBe(200);
    const ids = res.body.tweets.map((t) => t.id);
    expect(ids).toContain(fTweet.id);
    expect(ids).not.toContain(nfTweet.id);
  });

  it('does not return soft-deleted tweets', async () => {
    const { token } = await createAuthenticatedUser();

    const a = await createTweet(token, 'A1');
    expect(a.status).toBe(201);
    const tweetA = a.body.tweet;

    const b = await createTweet(token, 'A2');
    expect(b.status).toBe(201);
    const tweetB = b.body.tweet;

    const del = await deleteTweet(token, tweetB.id);
    expect(del.status).toBe(200);

    const res = await request(app).get('/api/feed').set('Authorization', `Bearer ${token}`);
    expect(res.status).toBe(200);
    const ids = res.body.tweets.map((t) => t.id);
    expect(ids).toContain(tweetA.id);
    expect(ids).not.toContain(tweetB.id);
  });

  it('rejects unauthenticated requests with HTTP 401', async () => {
    const res = await request(app).get('/api/feed');
    expect(res.status).toBe(401);
  });
});
