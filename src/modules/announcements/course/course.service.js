import prisma from '../../../common/database/prismaClient.js';

class CourseAnnouncementService {
  async createAnnouncement(teacherId, courseId, data) {
    return prisma.course_Announcement.create({ data: { ...data, teacher_id: teacherId, course_id: courseId } });
  }

  async getAnnouncements(courseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const announcements = await prisma.course_Announcement.findMany({
      where: { course_id: courseId },
      skip,
      take: limit,
      include: {
        polls: true,
        attachments: true,
        teacher: { include: { user: true } },
        _count: { select: { comments: true } }, // Add comment count
      },
    });
    return announcements.length > 0 ? announcements : null;
  }

  async getAnnouncementDetails(announcementId) {
    const announcement = await prisma.course_Announcement.findFirst({
      where: { announcement_id: announcementId },
      include: {
        polls: true,
        attachments: true,
        teacher: { include: { user: true } },
        _count: { select: { comments: true } }, // Add comment count
      },
    });
    return announcement;
  }

  async updateAnnouncement(announcementId, data) {
    return prisma.course_Announcement.update({ where: { announcement_id: announcementId }, data });
  }

  async deleteAnnouncement(announcementId) {
    return prisma.course_Announcement.delete({ where: { announcement_id: announcementId } });
  }
}

export default new CourseAnnouncementService();