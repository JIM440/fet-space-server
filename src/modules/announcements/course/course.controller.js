import CourseAnnouncementService from './course.service.js';
import SocketService from '../../../common/utils/socket.service.js';

class CourseAnnouncementController {
  async createAnnouncement(req, res) {
    const { courseId } = req.body;
    const announcement = await CourseAnnouncementService.createAnnouncement(req.user.user_id, courseId, req.body);
    SocketService.emitEvent(`course_${courseId}`, 'newAnnouncement', announcement);
    res.json(announcement);
  }

  async getAnnouncements(req, res) {
    const { courseId, page = 1, limit = 10 } = req.query;
    const announcements = await CourseAnnouncementService.getAnnouncements(courseId, page, limit);
    res.json(announcements);
  }

  async getAnnouncementDetails(req, res) {
    const announcement = await CourseAnnouncementService.getAnnouncementDetails(req.params.announcementId);
    res.json(announcement);
  }

  async updateAnnouncement(req, res) {
    const announcement = await CourseAnnouncementService.updateAnnouncement(req.params.announcementId, req.body);
    SocketService.emitEvent(`course_${announcement.course_id}`, 'updateAnnouncement', announcement);
    res.json(announcement);
  }

  async deleteAnnouncement(req, res) {
    const announcement = await CourseAnnouncementService.getAnnouncementDetails(req.params.announcementId);
    await CourseAnnouncementService.deleteAnnouncement(req.params.announcementId);
    SocketService.emitEvent(`course_${announcement.course_id}`, 'deleteAnnouncement', { announcementId: req.params.announcementId });
    res.json({ message: 'Announcement deleted' });
  }
}

export default new CourseAnnouncementController();