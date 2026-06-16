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

async function followUser(token, username) {
  return request(app).post(`/api/users/${username}/follow`).set('Authorization', `Bearer ${token}`);
}

describe('GET /api/users/:username/followers & /following - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('returns empty followers and following arrays for a user with no relationships', async () => {
    const { user } = await createAuthenticatedUser();

    const fRes = await request(app).get(`/api/users/${user.username}/followers`);
    expect(fRes.status).toBe(200);
    expect(Array.isArray(fRes.body.followers)).toBe(true);
    expect(fRes.body.followers.length).toBe(0);

    const foRes = await request(app).get(`/api/users/${user.username}/following`);
    expect(foRes.status).toBe(200);
    expect(Array.isArray(foRes.body.following)).toBe(true);
    expect(foRes.body.following.length).toBe(0);
  });

  it('returns followers for a user', async () => {
    const follower = await createAuthenticatedUser();
    const target = await createAuthenticatedUser();

    const followRes = await followUser(follower.token, target.user.username);
    expect(followRes.status).toBe(200);

    const res = await request(app).get(`/api/users/${target.user.username}/followers`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.followers)).toBe(true);
    expect(res.body.followers.length).toBe(1);

    const followerItem = res.body.followers[0];
    expect(followerItem).toHaveProperty('id');
    expect(followerItem).toHaveProperty('username', follower.user.username);
    expect(followerItem).toHaveProperty('displayName');
    expect(followerItem).toHaveProperty('bio');
    expect(followerItem).toHaveProperty('avatarUrl');
  });

  it('returns following for a user', async () => {
    const follower = await createAuthenticatedUser();
    const target = await createAuthenticatedUser();

    const followRes = await followUser(follower.token, target.user.username);
    expect(followRes.status).toBe(200);

    const res = await request(app).get(`/api/users/${follower.user.username}/following`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.following)).toBe(true);
    expect(res.body.following.length).toBe(1);

    const following = res.body.following[0];
    expect(following).toHaveProperty('id');
    expect(following).toHaveProperty('username', target.user.username);
    expect(following).toHaveProperty('displayName');
    expect(following).toHaveProperty('bio');
    expect(following).toHaveProperty('avatarUrl');
  });

  it('returns 404 for followers of a non-existing user', async () => {
    const res = await request(app).get('/api/users/unknownuser/followers');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('returns 404 for following of a non-existing user', async () => {
    const res = await request(app).get('/api/users/unknownuser/following');
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });
});
