import express from 'express';
import * as controller from './follow.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:username/follow', authMiddleware, controller.follow);
router.delete('/:username/follow', authMiddleware, controller.unfollow);

export default router;
