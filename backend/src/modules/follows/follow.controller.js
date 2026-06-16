import * as service from './follow.service.js';

export async function follow(req, res) {
  try {
    const username = req.params.username;
    await service.followUser(username, req.user);
    return res.status(200).json({ message: 'User followed successfully' });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function unfollow(req, res) {
  try {
    const username = req.params.username;
    await service.unfollowUser(username, req.user);
    return res.status(200).json({ message: 'User unfollowed successfully' });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
