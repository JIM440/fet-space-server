import { Router } from 'express';
import CommentController from './comment.controller.js';
import { authMiddleware } from '../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware(['Student', 'Teacher', 'Admin']), CommentController.createComment);
router.get('/', authMiddleware(['Student', 'Teacher', 'Admin']), CommentController.getComments);
router.put('/:commentId', authMiddleware(['Student', 'Teacher', 'Admin']), CommentController.updateComment);
router.delete('/:commentId', authMiddleware(['Student', 'Teacher', 'Admin']), CommentController.deleteComment);

export default router;