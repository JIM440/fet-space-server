import prisma from "../../../common/database/prismaClient.js";

class GeneralAnnouncementService {
  // async createAnnouncement(adminId, data) {
  //   console.log(data)
  //   return prisma.general_Announcement.create({
  //     data: { ...data, admin_id: adminId },
  //   });
  // }

async createAnnouncement(adminId, data) {
    console.log(data);
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
        const poll = await tx.poll.create({
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

        return { ...announcement, poll };
      }

      return announcement;
    });
  }

  async getAnnouncements(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const announcements = await prisma.general_Announcement.findMany({
      skip,
      take: parseInt(limit),
      orderBy: {
        created_at: "desc",
      },
      include: {
        poll: {
          include: {
            options: true,
            responses: true,
          },
        },
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
        poll: {
          include: {
            options: true, // Include poll options
            responses: true, // Optionally include responses
          },
        },
        attachments: true,
        admin: { include: { user: true } },
        _count: { select: { comments: true } },
      },
    });
    return announcement;
  }

  async updateAnnouncement(announcementId, data) {
    return prisma.general_Announcement.update({
      where: { announcement_id: parseInt(announcementId) },
      data,
    });
  }

  async deleteAnnouncement(announcementId) {
    return prisma.general_Announcement.delete({
      where: { announcement_id: parseInt(announcementId) },
    });
  }
}

export default new GeneralAnnouncementService();
