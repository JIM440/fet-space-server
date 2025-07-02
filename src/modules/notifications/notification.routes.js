import { Router } from 'express';
import NotificationController from './notification.controller.js';
import { authMiddleware } from '../../common/middlewares/authMiddleware.js';

const router = Router();

router.get('/', authMiddleware(['Student', 'Teacher', 'Admin', 'SuperAdmin']), NotificationController.getNotifications);
router.put('/:notificationId/read', authMiddleware(['Student', 'Teacher', 'Admin', 'SuperAdmin']), NotificationController.markNotificationAsRead);

export default router;