import * as service from './feed.service.js';

export async function getFeed(req, res) {
  try {
    const userId = req.user.id;
    const tweets = await service.getFeedForUser(userId);
    return res.status(200).json({ tweets });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
