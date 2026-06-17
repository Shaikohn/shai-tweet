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

async function createReply(token, parentTweetId, content) {
  return request(app).post(`/api/tweets/${parentTweetId}/replies`).set('Authorization', `Bearer ${token}`).send({ content });
}

async function deleteTweet(token, tweetId) {
  return request(app).delete(`/api/tweets/${tweetId}`).set('Authorization', `Bearer ${token}`);
}

async function likeTweet(token, tweetId) {
  return request(app).post(`/api/tweets/${tweetId}/like`).set('Authorization', `Bearer ${token}`);
}

describe('GET /api/tweets/:id/replies - thread retrieval integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('returns direct replies for an existing tweet', async () => {
    const author = await createAuthenticatedUser();
    const r1 = await createAuthenticatedUser();
    const r2 = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const aRes = await createReply(r1.token, parent.id, 'Reply one');
    expect(aRes.status).toBe(201);

    const bRes = await createReply(r2.token, parent.id, 'Reply two');
    expect(bRes.status).toBe(201);

    const res = await request(app).get(`/api/tweets/${parent.id}/replies`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(2);

    for (const t of res.body.tweets) {
      expect(t).toHaveProperty('id');
      expect(t).toHaveProperty('content');
      expect(t).toHaveProperty('imageUrl');
      expect(t).toHaveProperty('parentTweetId', parent.id);
      expect(t).toHaveProperty('createdAt');
      expect(t).toHaveProperty('likesCount');
      expect(t).toHaveProperty('author');
      expect(t.author).toHaveProperty('id');
      expect(t.author).toHaveProperty('username');
    }
  });

  it('returns replies ordered by oldest first', async () => {
    const author = await createAuthenticatedUser();
    const r1 = await createAuthenticatedUser();
    const r2 = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent order');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const aRes = await createReply(r1.token, parent.id, 'First reply');
    expect(aRes.status).toBe(201);
    const replyA = aRes.body.tweet;

    const bRes = await createReply(r2.token, parent.id, 'Second reply');
    expect(bRes.status).toBe(201);
    const replyB = bRes.body.tweet;

    const res = await request(app).get(`/api/tweets/${parent.id}/replies`);
    expect(res.status).toBe(200);
    const [first, second] = res.body.tweets;
    expect(first.id).toBe(replyA.id);
    expect(second.id).toBe(replyB.id);
  });

  it('includes likesCount for replies', async () => {
    const author = await createAuthenticatedUser();
    const replier = await createAuthenticatedUser();
    const liker = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent likes');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const rRes = await createReply(replier.token, parent.id, 'Reply to like');
    expect(rRes.status).toBe(201);
    const reply = rRes.body.tweet;

    const likeRes = await likeTweet(liker.token, reply.id);
    expect(likeRes.status).toBe(200);

    const res = await request(app).get(`/api/tweets/${parent.id}/replies`);
    expect(res.status).toBe(200);
    const found = res.body.tweets.find((t) => t.id === reply.id);
    expect(found).toBeTruthy();
    expect(found.likesCount).toBe(1);
  });

  it('does not return soft-deleted replies', async () => {
    const author = await createAuthenticatedUser();
    const r1 = await createAuthenticatedUser();
    const r2 = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent delete');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const aRes = await createReply(r1.token, parent.id, 'Keep me');
    expect(aRes.status).toBe(201);
    const replyA = aRes.body.tweet;

    const bRes = await createReply(r2.token, parent.id, 'Delete me');
    expect(bRes.status).toBe(201);
    const replyB = bRes.body.tweet;

    const del = await deleteTweet(r2.token, replyB.id);
    expect(del.status).toBe(200);

    const res = await request(app).get(`/api/tweets/${parent.id}/replies`);
    expect(res.status).toBe(200);
    const ids = res.body.tweets.map((t) => t.id);
    expect(ids).toContain(replyA.id);
    expect(ids).not.toContain(replyB.id);
  });

  it('returns an empty array when tweet has no replies', async () => {
    const author = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Lonely parent');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const res = await request(app).get(`/api/tweets/${parent.id}/replies`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.tweets)).toBe(true);
    expect(res.body.tweets.length).toBe(0);
  });

  it('returns 404 when parent tweet does not exist', async () => {
    const res = await request(app).get('/api/tweets/00000000-0000-0000-0000-000000000000/replies');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('returns 404 when parent tweet id format is invalid', async () => {
    const res = await request(app).get('/api/tweets/not-a-valid-id/replies');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('returns 404 when parent tweet is soft-deleted', async () => {
    const author = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent to be deleted');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const del = await deleteTweet(author.token, parent.id);
    expect(del.status).toBe(200);

    const res = await request(app).get(`/api/tweets/${parent.id}/replies`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('GET /api/tweets/:id returns tweet details including repliesCount and liked flag', async () => {
    const author = await createAuthenticatedUser();
    const r1 = await createAuthenticatedUser();
    const r2 = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent single');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const aRes = await createReply(r1.token, parent.id, 'Reply one');
    expect(aRes.status).toBe(201);
    const bRes = await createReply(r2.token, parent.id, 'Reply two');
    expect(bRes.status).toBe(201);

    const res = await request(app).get(`/api/tweets/${parent.id}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('tweet');
    const t = res.body.tweet;
    expect(t).toHaveProperty('id', parent.id);
    expect(t).toHaveProperty('content', parent.content);
    expect(t).toHaveProperty('repliesCount', 2);
    expect(t).toHaveProperty('likesCount');
    expect(t.likedByCurrentUser).toBe(false);

    const liker = await createAuthenticatedUser();
    const likeRes = await likeTweet(liker.token, parent.id);
    expect(likeRes.status).toBe(200);

    const resAuth = await request(app).get(`/api/tweets/${parent.id}`).set('Authorization', `Bearer ${liker.token}`);
    expect(resAuth.status).toBe(200);
    expect(resAuth.body.tweet.likesCount).toBe(1);
    expect(resAuth.body.tweet.likedByCurrentUser).toBe(true);
  });
});
