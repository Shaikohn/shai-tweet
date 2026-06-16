import express from 'express';
import * as controller from './user.controller.js';

const router = express.Router();

router.get('/:username/tweets', controller.getTweets);

export default router;
