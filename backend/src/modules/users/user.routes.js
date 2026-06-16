import express from 'express';
import * as controller from './user.controller.js';

const router = express.Router();

router.get('/search', controller.searchUsers);
router.get('/:username/tweets', controller.getTweets);
router.get('/:username/followers', controller.getFollowers);
router.get('/:username/following', controller.getFollowing);

export default router;
