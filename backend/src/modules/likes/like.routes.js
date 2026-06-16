import express from 'express';
import * as controller from './like.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/:id/like', authMiddleware, controller.like);
router.delete('/:id/like', authMiddleware, controller.unlike);

export default router;
