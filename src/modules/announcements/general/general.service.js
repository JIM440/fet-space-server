import prisma from '../../../common/database/prismaClient.js';
import SocketService from '../../../common/utils/socket.service.js';

class GeneralAnnouncementService {
  async createAnnouncement(adminId, data) {
    return prisma.$transaction(async (tx) => {
      // Create the general announcement
      const announcement = await tx.general_Announcement.create({
        data: {
          title: data.title,
          content: data.content,
          is_poll: data.is_poll,
          admin_id: adminId,
        },
      });

      // If it's a poll, create the associated poll and options
      if (data.is_poll && data.poll) {
        await tx.poll.create({
          data: {
            general_announcement_id: announcement.announcement_id,
            allow_multiple_answers: data.poll.allow_multiple_answers,
            type: data.poll.type,
            options: {
              create: data.poll.options.map((optionContent) => ({
                content: optionContent,
              })),
            },
          },
        });
      }

      // Handle attachments for regular announcements
      if (!data.is_poll && data.attachments && Array.isArray(data.attachments)) {
        await tx.attachment.createMany({
          data: data.attachments.map((url) => ({
            url,
            file_type: this.determineFileType(url),
            general_announcement_id: announcement.announcement_id,
          })),
        });
      }

      // Fetch all users except the creator for notifications
      const users = await tx.user.findMany({
        where: { user_id: { not: adminId } },
        select: { user_id: true },
      });

      const notificationData = users.map((user) => ({
        user_id: user.user_id,
        message: `New general announcement: ${data.title}`,
        is_read: false,
        general_announcement_id: announcement.announcement_id,
      }));

      if (notificationData.length > 0) {
        await tx.notification.createMany({ data: notificationData });
      }

      // Fetch full announcement for return and socket event
      const fullAnnouncement = await tx.general_Announcement.findUnique({
        where: { announcement_id: announcement.announcement_id },
        include: {
          poll: { include: { options: true, responses: true } },
          attachments: true,
          admin: { include: { user: true } },
        },
      });

      // Emit socket event to all users
      SocketService.emitEvent('platform_all', 'newGeneralAnnouncement', {
        ...fullAnnouncement,
        message: `New general announcement: ${data.title}`,
      });

      return fullAnnouncement;
    });
  }

  async getAnnouncements(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const announcements = await prisma.general_Announcement.findMany({
      skip,
      take: parseInt(limit),
      orderBy: { created_at: 'desc' },
      include: {
        poll: { include: { options: true, responses: true } },
        attachments: true,
        admin: { include: { user: true } },
        _count: { select: { comments: true } },
      },
    });
    return announcements.length > 0 ? announcements : null;
  }

  async getAnnouncementDetails(announcementId) {
    const announcement = await prisma.general_Announcement.findUnique({
      where: { announcement_id: parseInt(announcementId) },
      include: {
        poll: { include: { options: true, responses: true } },
        attachments: true,
        admin: { include: { user: true } },
        _count: { select: { comments: true } },
      },
    });
    return announcement;
  }

  async updateAnnouncement(announcementId, data) {
    const announcement = await prisma.general_Announcement.findUnique({
      where: { announcement_id: parseInt(announcementId) },
      include: { admin: true },
    });
    if (!announcement) throw new Error('Announcement not found');

    return prisma.$transaction(async (tx) => {
      const updatedAnnouncement = await tx.general_Announcement.update({
        where: { announcement_id: parseInt(announcementId) },
        data,
      });

      // Notify users if title or content changed
      if (data.title || data.content) {
        const users = await tx.user.findMany({
          where: { user_id: { not: announcement.admin_id } },
          select: { user_id: true },
        });

        const notificationData = users.map((user) => ({
          user_id: user.user_id,
          message: `General announcement "${data.title || announcement.title}" updated`,
          is_read: false,
          general_announcement_id: announcement.announcement_id,
        }));

        if (notificationData.length > 0) {
          await tx.notification.createMany({ data: notificationData });
        }
      }

      // Fetch full announcement for return and socket event
      const fullAnnouncement = await tx.general_Announcement.findUnique({
        where: { announcement_id: parseInt(announcementId) },
        include: {
          poll: { include: { options: true, responses: true } },
          attachments: true,
          admin: { include: { user: true } },
        },
      });

      // Emit socket event
      SocketService.emitEvent('platform_all', 'updateGeneralAnnouncement', {
        ...fullAnnouncement,
        message: `General announcement "${data.title || announcement.title}" updated`,
      });

      return fullAnnouncement;
    });
  }

  async deleteAnnouncement(announcementId) {
    return prisma.general_Announcement.delete({
      where: { announcement_id: parseInt(announcementId) },
    });
  }

  determineFileType(url) {
    if (url.endsWith('.pdf')) return 'pdf';
    if (url.endsWith('.doc') || url.endsWith('.docx')) return 'doc';
    if (url.match(/\.(jpeg|jpg|png|gif)$/i)) return 'img';
    if (url.endsWith('.mp4') || url.endsWith('.mov')) return 'video';
    return 'pdf';
  }
}

export default new GeneralAnnouncementService();