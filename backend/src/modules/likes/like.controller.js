import * as service from './like.service.js';

export async function like(req, res) {
  try {
    const tweetId = req.params.id;
    await service.likeTweet(tweetId, req.user);
    return res.status(200).json({ message: 'Tweet liked successfully' });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}

export async function unlike(req, res) {
  try {
    const tweetId = req.params.id;
    await service.unlikeTweet(tweetId, req.user);
    return res.status(200).json({ message: 'Tweet unliked successfully' });
  } catch (err) {
    if (err && err.status) {
      return res.status(err.status).json({ message: err.message });
    }
    console.error(err);
    return res.status(500).json({ message: 'Internal server error' });
  }
}
