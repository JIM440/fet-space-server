import { Router } from 'express';
import GeneralAnnouncementController from './general.controller.js';
import { authMiddleware } from '../../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware(['Admin', 'SuperAdmin']), GeneralAnnouncementController.createAnnouncement);
router.get('/', authMiddleware(['Student', 'Teacher', 'Admin']), GeneralAnnouncementController.getAnnouncements);
router.get('/:announcementId', authMiddleware(['Student', 'Teacher', 'Admin']), GeneralAnnouncementController.getAnnouncementDetails);
router.put('/:announcementId', authMiddleware(['Admin', 'SuperAdmin']), GeneralAnnouncementController.updateAnnouncement);
router.delete('/:announcementId', authMiddleware(['Admin', 'SuperAdmin']), GeneralAnnouncementController.deleteAnnouncement);

export default router;