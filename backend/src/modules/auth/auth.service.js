import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import * as repo from './auth.repository.js';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const usernameRegex = /^[a-z0-9_]{3,30}$/;

export async function registerUser(payload) {
  let { email, password, username, displayName } = payload || {};

  const errors = [];

  if (!email || typeof email !== 'string') {
    errors.push({ field: 'email', message: 'Email is required' });
  } else {
    email = email.trim().toLowerCase();
    if (!emailRegex.test(email)) {
      errors.push({ field: 'email', message: 'Email is not valid' });
    }
  }

  if (!password || typeof password !== 'string') {
    errors.push({ field: 'password', message: 'Password is required' });
  } else if (password.length < 8) {
    errors.push({ field: 'password', message: 'Password must be at least 8 characters' });
  }

  if (!username || typeof username !== 'string') {
    errors.push({ field: 'username', message: 'Username is required' });
  } else {
    username = username.trim().toLowerCase();
    if (username.length < 3 || username.length > 30 || !usernameRegex.test(username)) {
      errors.push({ field: 'username', message: 'Username must be 3-30 characters and contain only letters, numbers, and underscores' });
    }
  }

  if (!displayName || typeof displayName !== 'string') {
    errors.push({ field: 'displayName', message: 'Display name is required' });
  } else {
    displayName = displayName.trim();
    if (displayName.length < 1 || displayName.length > 100) {
      errors.push({ field: 'displayName', message: 'Display name must be 1-100 characters' });
    }
  }

  if (errors.length > 0) {
    const err = new Error('Validation failed');
    err.status = 400;
    err.details = errors;
    throw err;
  }

  // Check for existing email and username
  const existingByEmail = await repo.findByEmail(email);
  if (existingByEmail) {
    const err = new Error('Email already in use');
    err.status = 409;
    throw err;
  }

  const existingByUsername = await repo.findByUsername(username);
  if (existingByUsername) {
    const err = new Error('Username already in use');
    err.status = 409;
    throw err;
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const created = await repo.createUser({ email, passwordHash, username, displayName });

  const user = {
    id: created.id,
    email: created.email,
    username: created.username,
    displayName: created.display_name,
    bio: created.bio ?? null,
    avatarUrl: created.avatar_url ?? null,
    createdAt: created.created_at ? (created.created_at instanceof Date ? created.created_at.toISOString() : new Date(created.created_at).toISOString()) : null,
  };

  return user;
}

export async function loginUser(payload) {
  let { email, password } = payload || {};

  if (!email || typeof email !== 'string' || !password || typeof password !== 'string') {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  email = String(email).trim().toLowerCase();

  const userRow = await repo.findByEmail(email);
  if (!userRow) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const match = await bcrypt.compare(password, userRow.password_hash);
  if (!match) {
    const err = new Error('Invalid credentials');
    err.status = 401;
    throw err;
  }

  const user = {
    id: userRow.id,
    email: userRow.email,
    username: userRow.username,
    displayName: userRow.display_name,
    bio: userRow.bio ?? null,
    avatarUrl: userRow.avatar_url ?? null,
  };

  const secret = process.env.JWT_SECRET;
  if (!secret) {
    const err = new Error('JWT secret not configured');
    err.status = 500;
    throw err;
  }

  const token = jwt.sign({ sub: user.id, username: user.username }, secret, { expiresIn: "7d" });

  return { token, user };
}