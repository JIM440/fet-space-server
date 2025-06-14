import prisma from '../../../common/database/prismaClient.js';

class CourseAnnouncementService {
  async createAnnouncement(teacherId, courseId, data) {
    return prisma.course_Announcement.create({ data: { ...data, teacher_id: teacherId, course_id: courseId } });
  }

  async getAnnouncements(courseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.course_Announcement.findMany({
      where: { course_id: courseId },
      skip,
      take: limit,
      include: { Polls: true, Attachments: true, teacher: { include: { user: true } } },
    });
  }

  async getAnnouncementDetails(announcementId) {
    return prisma.course_Announcement.findUnique({
      where: { announcement_id: announcementId },
      include: { Polls: true, Attachments: true, teacher: { include: { user: true } } },
    });
  }

  async updateAnnouncement(announcementId, data) {
    return prisma.course_Announcement.update({ where: { announcement_id: announcementId }, data });
  }

  async deleteAnnouncement(announcementId) {
    return prisma.course_Announcement.delete({ where: { announcement_id: announcementId } });
  }
}

export default new CourseAnnouncementService();