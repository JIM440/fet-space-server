import prisma from '../../../common/database/prismaClient.js';

class GeneralAnnouncementService {
  async createAnnouncement(adminId, data) {
    return prisma.general_Announcement.create({ data: { ...data, admin_id: adminId } });
  }

  async getAnnouncements(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.general_Announcement.findMany({
      skip,
      take: limit,
      include: { Polls: true, Attachments: true, admin: { include: { user: true } } },
    });
  }

  async getAnnouncementDetails(announcementId) {
    return prisma.general_Announcement.findUnique({
      where: { announcement_id: announcementId },
      include: { Polls: true, Attachments: true, admin: { include: { user: true } } },
    });
  }

  async updateAnnouncement(announcementId, data) {
    return prisma.general_Announcements.update({ where: { announcement_id: announcementId }, data });
  }

  async deleteAnnouncement(announcementId) {
    return prisma.general_Announcement.delete({ where: { announcement_id: announcementId } });
  }
}

export default new GeneralAnnouncementService();