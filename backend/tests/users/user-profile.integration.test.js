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

async function followUser(token, username) {
  return request(app).post(`/api/users/${username}/follow`).set('Authorization', `Bearer ${token}`);
}

describe('GET /api/users/:username - profile integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('returns user profile for an existing user', async () => {
    const { user } = await createAuthenticatedUser();

    const res = await request(app).get(`/api/users/${user.username}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    const u = res.body.user;
    expect(u).toHaveProperty('id');
    expect(u).toHaveProperty('username', user.username);
    expect(u).toHaveProperty('displayName');
    expect(u).toHaveProperty('bio');
    expect(u).toHaveProperty('avatarUrl');
    expect(u).toHaveProperty('followersCount');
    expect(u).toHaveProperty('followingCount');
    expect(u).toHaveProperty('tweetsCount');
  });

  it('returns correct followersCount and followingCount', async () => {
    const userA = await createAuthenticatedUser();
    const userB = await createAuthenticatedUser();
    const userC = await createAuthenticatedUser();

    const followAtoB = await followUser(userA.token, userB.user.username);
    expect(followAtoB.status).toBe(200);

    const followCtoA = await followUser(userC.token, userA.user.username);
    expect(followCtoA.status).toBe(200);

    const res = await request(app).get(`/api/users/${userA.user.username}`);
    expect(res.status).toBe(200);

    const profile = res.body.user;
    expect(profile.followersCount).toBe(1);
    expect(profile.followingCount).toBe(1);
   });

  it('returns correct tweetsCount excluding soft-deleted tweets', async () => {
    const user = await createAuthenticatedUser();

    const firstTweet = await createTweet(user.token, 'Tweet one');
    expect(firstTweet.status).toBe(201);

    const secondTweet = await createTweet(user.token, 'Tweet two');
    expect(secondTweet.status).toBe(201);

    const tweetToDelete = secondTweet.body.tweet;

    const deleteRes = await deleteTweet(user.token, tweetToDelete.id);
    expect(deleteRes.status).toBe(200);

    const res = await request(app).get(`/api/users/${user.user.username}`);
    expect(res.status).toBe(200);

    const profile = res.body.user;
    expect(profile.tweetsCount).toBe(1);
  });

  it('returns 404 for non-existing user', async () => {
    const res = await request(app).get('/api/users/unknownuser');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});
