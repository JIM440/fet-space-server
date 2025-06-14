import { Router } from 'express';
import CourseAnnouncementController from './course.controller.js';
import { authMiddleware } from '../../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware(['Teacher']), CourseAnnouncementController.createAnnouncement);
router.get('/', authMiddleware(['Student', 'Teacher']), CourseAnnouncementController.getAnnouncements);
router.get('/:announcementId', authMiddleware(['Student', 'Teacher']), CourseAnnouncementController.getAnnouncementDetails);
router.put('/:announcementId', authMiddleware(['Teacher']), CourseAnnouncementController.updateAnnouncement);
router.delete('/:announcementId', authMiddleware(['Teacher']), CourseAnnouncementController.deleteAnnouncement);

export default router;