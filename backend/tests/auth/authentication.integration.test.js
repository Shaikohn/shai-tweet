import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/config/database.js';

describe('GET /api/auth/me - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM users');
  });

  it('returns current user with a valid token', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const userPayload = {
      email: `me+${unique}@example.com`,
      password: 'Password123!',
      username: `me_${unique}`,
      displayName: 'Me User',
    };

    await request(app).post('/api/auth/register').send(userPayload).expect(201);

    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: userPayload.email, password: userPayload.password });

    expect(loginRes.status).toBe(200);
    const { token } = loginRes.body;
    expect(token).toBeTruthy();

    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('user');
    const user = res.body.user;
    expect(user).toHaveProperty('id');
    expect(user).toHaveProperty('username');
    expect(user.username).toBe(userPayload.username);
    // ensure /me returns full user shape
    expect(user).toHaveProperty('displayName');
    expect(user.displayName).toBe(userPayload.displayName);
    expect(user).toHaveProperty('bio');
    expect(user).toHaveProperty('avatarUrl');
  });

  it('rejects missing token', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Authentication required');
  });

  it('rejects invalid token', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid-token');

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid token');
  });
});
