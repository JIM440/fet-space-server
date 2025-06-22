import { Router } from 'express';
import PollController from './poll.controller.js';
import { authMiddleware } from '../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware(['Teacher', 'Admin']), PollController.createPoll);
router.post('/toggle-vote', authMiddleware(['Student', 'Teacher', 'Admin']), PollController.toggleVote);
router.get('/:pollId/responses', authMiddleware(['Student', 'Teacher', 'Admin']), PollController.getPollResponses);

export default router;