import express from 'express';
import * as controller from './feed.controller.js';
import authMiddleware from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/', authMiddleware, controller.getFeed);

export default router;
