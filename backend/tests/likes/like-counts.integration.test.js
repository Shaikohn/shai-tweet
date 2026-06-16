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

describe('Like counts integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('POST /api/tweets returns likesCount: 0 and timeline/feed reflect likes/unlikes', async () => {
    const author = await createAuthenticatedUser();
    const liker = await createAuthenticatedUser();

    const createRes = await createTweet(author.token, 'Likes count test');
    expect(createRes.status).toBe(201);
    const tweet = createRes.body.tweet;
    expect(tweet).toHaveProperty('likesCount');
    expect(tweet.likesCount).toBe(0);

    const likeRes = await request(app).post(`/api/tweets/${tweet.id}/like`).set('Authorization', `Bearer ${liker.token}`);
    expect(likeRes.status).toBe(200);

    const timelineRes = await request(app).get(`/api/users/${author.user.username}/tweets`);
    expect(timelineRes.status).toBe(200);
    const timelineTweet = timelineRes.body.tweets.find((t) => t.id === tweet.id);
    expect(timelineTweet).toBeTruthy();
    expect(timelineTweet.likesCount).toBe(1);

    const feedRes = await request(app).get('/api/feed').set('Authorization', `Bearer ${author.token}`);
    expect(feedRes.status).toBe(200);
    const feedTweet = feedRes.body.tweets.find((t) => t.id === tweet.id);
    expect(feedTweet).toBeTruthy();
    expect(feedTweet.likesCount).toBe(1);

    const unlikeRes = await request(app).delete(`/api/tweets/${tweet.id}/like`).set('Authorization', `Bearer ${liker.token}`);
    expect(unlikeRes.status).toBe(200);

    const timelineAfter = await request(app).get(`/api/users/${author.user.username}/tweets`);
    expect(timelineAfter.status).toBe(200);
    const timelineTweetAfter = timelineAfter.body.tweets.find((t) => t.id === tweet.id);
    expect(timelineTweetAfter).toBeTruthy();
    expect(timelineTweetAfter.likesCount).toBe(0);

    const feedAfter = await request(app).get('/api/feed').set('Authorization', `Bearer ${author.token}`);
    expect(feedAfter.status).toBe(200);
    const feedTweetAfter = feedAfter.body.tweets.find((t) => t.id === tweet.id);
    expect(feedTweetAfter).toBeTruthy();
    expect(feedTweetAfter.likesCount).toBe(0);
  });
});
