import { Router } from 'express';
import PollController from './poll.controller.js';
import { authMiddleware } from '../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware(['Teacher', 'Admin']), PollController.createPoll);
router.post('/respond', authMiddleware(['Student', 'Teacher', 'Admin']), PollController.respondToPoll);
router.get('/:pollId/responses', authMiddleware(['Teacher', 'Admin']), PollController.getPollResponses);

export default router;