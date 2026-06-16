import * as service from './feed.service.js';

export async function getFeed(req, res) {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const result = await service.getFeedForUser(userId, safePage, safeLimit);
    return res.status(200).json(result);
  } catch (err) {
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
