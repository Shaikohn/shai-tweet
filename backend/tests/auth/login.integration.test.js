import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../../src/app.js';
import pool from '../../src/config/database.js';

describe('POST /api/auth/login - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM users');
  });

  it('successfully logs in with valid credentials', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const userPayload = {
      email: `login-demo+${unique}@example.com`,
      password: 'Password123!',
      username: `demo_${unique}`,
      displayName: 'Demo User',
    };

    await request(app).post('/api/auth/register').send(userPayload).expect(201);

    const res = await request(app).post('/api/auth/login').send({
      email: userPayload.email,
      password: userPayload.password,
    });

    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
    expect(res.body).toHaveProperty('user');

    const { token, user } = res.body;
    expect(user).toHaveProperty('id');
    expect(user.email).toBe(userPayload.email);
    expect(user.username).toBe(userPayload.username);
    expect(user.displayName).toBe(userPayload.displayName);

    const secret = process.env.JWT_SECRET;
    expect(secret).toBeTruthy();

    const decoded = jwt.verify(token, secret);
    expect(decoded).toHaveProperty('sub');
    expect(decoded).toHaveProperty('username');
    expect(decoded.username).toBe(user.username);
  });

  it('rejects unknown email', async () => {
    const res = await request(app).post('/api/auth/login').send({
      email: 'notfound@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('rejects invalid password', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const userPayload = {
      email: `userpw+${unique}@example.com`,
      password: 'Password123!',
      username: `userpw_${unique}`,
      displayName: 'User Pw',
    };

    await request(app).post('/api/auth/register').send(userPayload).expect(201);

    const res = await request(app).post('/api/auth/login').send({
      email: userPayload.email,
      password: 'WrongPassword!',
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });

  it('rejects missing credentials', async () => {
    const unique = `${Date.now()}${Math.random().toString(36).slice(2,8)}`;
    const res = await request(app).post('/api/auth/login').send({
      email: `login-demo+${unique}@example.com`,
    });

    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('message', 'Invalid credentials');
  });
});
