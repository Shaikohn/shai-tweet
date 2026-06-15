import * as service from './auth.service.js';

export async function register(req, res) {
  try {
    const user = await service.registerUser(req.body);
    return res.status(201).json({ user });
  } catch (err) {
    if (err && err.status) {
      const payload = { message: err.message };
      if (err.details) payload.details = err.details;
      return res.status(err.status).json(payload);
    }

    // Postgres unique constraint error code
    if (err && err.code === '23505') {
      return res.status(409).json({ message: 'Email or username already exists' });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function login(req, res) {
  try {
    const { token, user } = await service.loginUser(req.body);
    return res.status(200).json({ token, user });
  } catch (err) {
    if (err && err.status === 401) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function me(req, res) {
  return res.status(200).json({
    user: {
      id: req.user.id,
      username: req.user.username,
    },
  });
}