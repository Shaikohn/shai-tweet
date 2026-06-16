import * as service from './user.service.js';

export async function getTweets(req, res) {
  try {
    const username = req.params.username;
    const tweets = await service.getUserTweets(username);
    return res.status(200).json({ tweets });
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
