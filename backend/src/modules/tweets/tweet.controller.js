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

export async function remove(req, res) {
  try {
    const tweetId = req.params.id;
    await service.deleteTweet(tweetId, req.user);
    return res.status(200).json({ message: 'Tweet deleted successfully' });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function createReply(req, res) {
  try {
    const parentId = req.params.id;
    const tweet = await service.createReply(req.body, req.user, parentId);
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

export async function getReplies(req, res) {
  try {
    const parentId = req.params.id;
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const currentUserId = req.user ? req.user.id : null;
    const result = await service.getReplies(parentId, safePage, safeLimit, currentUserId);
    return res.status(200).json(result);
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getTweet(req, res) {
  try {
    const tweetId = req.params.id;
    const currentUserId = req.user ? req.user.id : null;
    const tweet = await service.getTweetById(tweetId, currentUserId);
    return res.status(200).json({ tweet });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
