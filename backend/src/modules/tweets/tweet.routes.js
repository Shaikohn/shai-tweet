import express from 'express';
import * as controller from './tweet.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/', authMiddleware, controller.create);
router.get('/:id/replies', controller.getReplies);
router.post('/:id/replies', authMiddleware, controller.createReply);
router.delete('/:id', authMiddleware, controller.remove);

export default router;
