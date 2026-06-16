import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/config/database.js';

async function registerUser(user) {
  return request(app).post('/api/auth/register').send(user);
}

describe('GET /api/users/search - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM likes');
    await pool.query('DELETE FROM follows');
    await pool.query('DELETE FROM tweets');
    await pool.query('DELETE FROM users');
  });

  it('finds users by username', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const username = `finduser_${unique}`;
    const reg = await registerUser({ email: `u+${unique}@example.com`, password: 'Password123!', username, displayName: 'Finder' });
    expect(reg.status).toBe(201);

    const res = await request(app).get(`/api/users/search?q=${encodeURIComponent(username)}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    const u = res.body.users.find((x) => x.username === username);
    expect(u).toBeTruthy();
    expect(u).toHaveProperty('id');
    expect(u).toHaveProperty('displayName');
    expect(u).toHaveProperty('bio');
    expect(u).toHaveProperty('avatarUrl');
  });

  it('finds users by displayName', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const displayName = `Display ${unique}`;
    const reg = await registerUser({ email: `d+${unique}@example.com`, password: 'Password123!', username: `disp_${unique}`, displayName });
    expect(reg.status).toBe(201);

    const res = await request(app).get(`/api/users/search?q=${encodeURIComponent('Display')}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    const u = res.body.users.find((x) => x.displayName === displayName);
    expect(u).toBeTruthy();
  });

  it('search is case-insensitive', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const username = `caseuser_${unique}`;
    const reg = await registerUser({ email: `c+${unique}@example.com`, password: 'Password123!', username, displayName: 'Casey' });
    expect(reg.status).toBe(201);

    const res = await request(app).get(`/api/users/search?q=${encodeURIComponent(username.toUpperCase())}`);
    expect(res.status).toBe(200);
    expect(res.body.users.find((x) => x.username.toUpperCase() === username.toUpperCase())).toBeTruthy();
  });

  it('returns an empty array when there are no matches', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const reg = await registerUser({ email: `nm+${unique}@example.com`, password: 'Password123!', username: `nomatch_${unique}`, displayName: 'No Match' });
    expect(reg.status).toBe(201);

    const res = await request(app).get('/api/users/search?q=thereisnosuchuser');
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBe(0);
  });

  it('returns 400 when q is missing', async () => {
    const res = await request(app).get('/api/users/search');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Search query is required');
  });

  it('returns 400 when q is empty', async () => {
    const res = await request(app).get('/api/users/search?q=   ');
    expect(res.status).toBe(400);
    expect(res.body).toHaveProperty('message', 'Search query is required');
  });

  it('limits results to 10 users', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const prefix = `limit_${unique}`;
    for (let i = 0; i < 12; i++) {
      const reg = await registerUser({ email: `l+${unique}_${i}@example.com`, password: 'Password123!', username: `${prefix}_${i}`, displayName: `Limit ${i}` });
      expect(reg.status).toBe(201);
    }

    const res = await request(app).get(`/api/users/search?q=${encodeURIComponent(prefix)}`);
    expect(res.status).toBe(200);
    expect(Array.isArray(res.body.users)).toBe(true);
    expect(res.body.users.length).toBe(10);
  });
});
