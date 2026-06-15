import { describe, it, beforeEach, expect } from 'vitest';
import request from 'supertest';
import app from '../../src/app.js';
import pool from '../../src/config/database.js';

describe('POST /api/auth/register - integration', () => {
  beforeEach(async () => {
    await pool.query('DELETE FROM users');
  });

  it('successfully registers a user', async () => {
    const payload = {
      email: 'demo@example.com',
      password: 'Password123!',
      username: 'demo',
      displayName: 'Demo User',
    };

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(201);
    expect(res.body).toHaveProperty('user');

    const user = res.body.user;
    expect(user).toHaveProperty('id');
    expect(user.email).toBe('demo@example.com');
    expect(user.username).toBe('demo');
    expect(user.displayName).toBe('Demo User');
    expect(user.bio).toBeNull();
    expect(user.avatarUrl).toBeNull();
    expect(typeof user.createdAt).toBe('string');
    expect(user).not.toHaveProperty('password_hash');
    expect(user).not.toHaveProperty('passwordHash');
  });

  it('rejects invalid email', async () => {
    const payload = {
      email: 'invalid-email',
      password: 'Password123!',
      username: 'user1',
      displayName: 'User One',
    };

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(400);
  });

  it('rejects short password', async () => {
    const payload = {
      email: 'shortpass@example.com',
      password: 'short',
      username: 'shortuser',
      displayName: 'Short',
    };

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(400);
  });

  it('rejects invalid username', async () => {
    const payload = {
      email: 'baduser@example.com',
      password: 'Password123!',
      username: 'ab',
      displayName: 'Bad User',
    };

    const res = await request(app).post('/api/auth/register').send(payload);

    expect(res.status).toBe(400);
  });

  it('rejects duplicate email', async () => {
    const first = {
      email: 'dup@example.com',
      password: 'Password123!',
      username: 'firstuser',
      displayName: 'First',
    };

    const second = {
      email: 'dup@example.com',
      password: 'Password123!',
      username: 'seconduser',
      displayName: 'Second',
    };

    await request(app).post('/api/auth/register').send(first).expect(201);

    const res = await request(app).post('/api/auth/register').send(second);
    expect(res.status).toBe(409);
  });

  it('rejects duplicate username', async () => {
    const first = {
      email: 'unique1@example.com',
      password: 'Password123!',
      username: 'duplicateuser',
      displayName: 'First',
    };

    const second = {
      email: 'unique2@example.com',
      password: 'Password123!',
      username: 'duplicateuser',
      displayName: 'Second',
    };

    await request(app).post('/api/auth/register').send(first).expect(201);

    const res = await request(app).post('/api/auth/register').send(second);
    expect(res.status).toBe(409);
  });
});
