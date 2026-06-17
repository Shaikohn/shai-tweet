import * as service from './user.service.js';

export async function getTweets(req, res) {
  try {
    const username = req.params.username;
    const page = parseInt(req.query.page, 10);
    const limit = parseInt(req.query.limit, 10);

    const safePage = Number.isInteger(page) && page > 0 ? page : 1;
    const safeLimit = Number.isInteger(limit) && limit > 0 ? Math.min(limit, 50) : 20;

    const currentUserId = req.user ? req.user.id : null;
    const result = await service.getUserTweets(username, safePage, safeLimit, currentUserId);
    return res.status(200).json(result);
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function searchUsers(req, res) {
  try {
    const q = req.query.q;
    const users = await service.searchUsers(q);
    return res.status(200).json({ users });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getProfile(req, res) {
  try {
    const username = req.params.username;
    const currentUserId = req.user ? req.user.id : null;
    const user = await service.getUserProfile(username, currentUserId);
    return res.status(200).json({ user });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getFollowers(req, res) {
  try {
    const username = req.params.username;
    const followers = await service.getFollowers(username);
    return res.status(200).json({ followers });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function getFollowing(req, res) {
  try {
    const username = req.params.username;
    const following = await service.getFollowing(username);
    return res.status(200).json({ following });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }

    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
