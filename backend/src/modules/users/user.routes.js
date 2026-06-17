import express from 'express';
import * as controller from './user.controller.js';
import optionalAuthMiddleware from '../../middleware/optionalAuth.middleware.js';

const router = express.Router();

router.get('/search', controller.searchUsers);
router.get('/:username/tweets', controller.getTweets);
router.get('/:username/followers', controller.getFollowers);
router.get('/:username/following', controller.getFollowing);
router.get('/:username', optionalAuthMiddleware, controller.getProfile);

export default router;
