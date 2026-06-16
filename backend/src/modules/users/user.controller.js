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
