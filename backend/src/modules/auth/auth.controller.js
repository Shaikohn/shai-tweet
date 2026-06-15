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
