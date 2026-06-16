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

describe('POST /api/tweets/:id/replies - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('allows an authenticated user to reply to an existing tweet', async () => {
    const replier = await createAuthenticatedUser();
    const author = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent tweet');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const res = await request(app)
      .post(`/api/tweets/${parent.id}/replies`)
      .set('Authorization', `Bearer ${replier.token}`)
      .send({ content: 'This is a reply' });

    expect(res.status).toBe(201);
    const reply = res.body.tweet;
    expect(reply.parentTweetId).toBe(parent.id);
    expect(reply.likesCount).toBe(0);
    expect(reply.author).toHaveProperty('username', replier.user.username);

    const db = await pool.query('SELECT parent_tweet_id FROM tweets WHERE id = $1', [reply.id]);
    expect(db.rows.length).toBe(1);
    expect(db.rows[0].parent_tweet_id).toBe(parent.id);
  });

  it('rejects unauthenticated replies', async () => {
    const author = await createAuthenticatedUser();
    const pRes = await createTweet(author.token, 'Parent tweets for auth test');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const res = await request(app).post(`/api/tweets/${parent.id}/replies`).send({ content: 'Hi' });
    expect(res.status).toBe(401);
  });

  it('returns 404 when parent tweet does not exist', async () => {
    const replier = await createAuthenticatedUser();
    const res = await request(app)
      .post('/api/tweets/00000000-0000-0000-0000-000000000000/replies')
      .set('Authorization', `Bearer ${replier.token}`)
      .send({ content: 'Reply to nowhere' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('returns 404 when parent tweet id format is invalid', async () => {
    const replier = await createAuthenticatedUser();
    const res = await request(app)
      .post('/api/tweets/not-a-valid-id/replies')
      .set('Authorization', `Bearer ${replier.token}`)
      .send({ content: 'Reply to invalid id' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('returns 404 when parent tweet is soft-deleted', async () => {
    const replier = await createAuthenticatedUser();
    const author = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent tweet to delete');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const del = await deleteTweet(author.token, parent.id);
    expect(del.status).toBe(200);

    const res = await request(app)
      .post(`/api/tweets/${parent.id}/replies`)
      .set('Authorization', `Bearer ${replier.token}`)
      .send({ content: 'Reply after delete' });

    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Tweet not found');
  });

  it('rejects empty reply content', async () => {
    const replier = await createAuthenticatedUser();
    const author = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent for empty content');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const res = await request(app)
      .post(`/api/tweets/${parent.id}/replies`)
      .set('Authorization', `Bearer ${replier.token}`)
      .send({ content: '   ' });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
  });

  it('rejects reply content longer than 280 characters', async () => {
    const replier = await createAuthenticatedUser();
    const author = await createAuthenticatedUser();

    const pRes = await createTweet(author.token, 'Parent for long content');
    expect(pRes.status).toBe(201);
    const parent = pRes.body.tweet;

    const longContent = 'x'.repeat(281);
    const res = await request(app)
      .post(`/api/tweets/${parent.id}/replies`)
      .set('Authorization', `Bearer ${replier.token}`)
      .send({ content: longContent });

    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Validation failed');
  });
});
