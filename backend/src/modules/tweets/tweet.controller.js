import * as service from './tweet.service.js';

export async function create(req, res) {
  try {
    const tweet = await service.createTweet(req.body, req.user);
    return res.status(201).json({ tweet });
  } catch (err) {
    if (err && err.status) {
      const payload = { message: err.message };
      if (err.details) payload.details = err.details;
      return res.status(err.status).json(payload);
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
