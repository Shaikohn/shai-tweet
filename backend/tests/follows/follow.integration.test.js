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

describe('POST/DELETE /api/users/:username/follow - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('allows an authenticated user to follow another user', async () => {
    const follower = await createAuthenticatedUser();
    const target = await createAuthenticatedUser();

    const res = await request(app).post(`/api/users/${target.user.username}/follow`).set('Authorization', `Bearer ${follower.token}`);
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('message', 'User followed successfully');

    const db = await pool.query('SELECT follower_id, following_id FROM follows WHERE follower_id = $1 AND following_id = $2', [follower.user.id, target.user.id]);
    expect(db.rows.length).toBe(1);
    expect(db.rows[0].follower_id).toBe(follower.user.id);
    expect(db.rows[0].following_id).toBe(target.user.id);
  });

  it('rejects duplicate follow', async () => {
    const follower = await createAuthenticatedUser();
    const target = await createAuthenticatedUser();

    const first = await request(app).post(`/api/users/${target.user.username}/follow`).set('Authorization', `Bearer ${follower.token}`);
    expect(first.status).toBe(200);

    const second = await request(app).post(`/api/users/${target.user.username}/follow`).set('Authorization', `Bearer ${follower.token}`);
    expect(second.status).toBe(409);
    expect(second.body).toHaveProperty('message', 'Already following user');
  });

  it('rejects self follow', async () => {
    const follower = await createAuthenticatedUser();

    const res = await request(app).post(`/api/users/${follower.user.username}/follow`).set('Authorization', `Bearer ${follower.token}`);
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'You cannot follow yourself');
  });

  it('returns 404 when trying to follow a non-existing user', async () => {
    const follower = await createAuthenticatedUser();

    const res = await request(app).post('/api/users/unknownuser/follow').set('Authorization', `Bearer ${follower.token}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'User not found');
  });

  it('allows an authenticated user to unfollow another user', async () => {
    const follower = await createAuthenticatedUser();
    const target = await createAuthenticatedUser();

    const followRes = await request(app).post(`/api/users/${target.user.username}/follow`).set('Authorization', `Bearer ${follower.token}`);
    expect(followRes.status).toBe(200);

    const unfollowRes = await request(app).delete(`/api/users/${target.user.username}/follow`).set('Authorization', `Bearer ${follower.token}`);
    expect(unfollowRes.status).toBe(200);
    expect(unfollowRes.body).toHaveProperty('message', 'User unfollowed successfully');

    const db = await pool.query('SELECT follower_id, following_id FROM follows WHERE follower_id = $1 AND following_id = $2', [follower.user.id, target.user.id]);
    expect(db.rows.length).toBe(0);
  });

  it('returns 404 when trying to unfollow a user that is not followed', async () => {
    const follower = await createAuthenticatedUser();
    const target = await createAuthenticatedUser();

    const res = await request(app).delete(`/api/users/${target.user.username}/follow`).set('Authorization', `Bearer ${follower.token}`);
    expect(res.status).toBe(404);
    expect(res.body).toHaveProperty('message', 'Follow relationship not found');
  });

  it('rejects unauthenticated follow request', async () => {
    const target = await createAuthenticatedUser();

    const res = await request(app).post(`/api/users/${target.user.username}/follow`);
    expect(res.status).toBe(401);
  });
});
