import { Router } from 'express';
import NotificationController from './notification.controller.js';
import { authMiddleware } from '../../common/middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware(['Student', 'Teacher', 'Admin']), NotificationController.getNotifications);

export default router;