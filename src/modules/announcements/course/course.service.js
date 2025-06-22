import prisma from '../../../common/database/prismaClient.js';

class CourseAnnouncementService {
  async createAnnouncement(teacherId, courseId, data) {
    console.log(data);
    return prisma.$transaction(async (tx) => {
      // Create the course announcement
      const announcement = await tx.course_Announcement.create({
        data: {
          title: data.title,
          content: data.content,
          is_poll: data.is_poll,
          teacher_id: teacherId,
          course_id: courseId,
        },
      });

      // If it's a poll, create the associated poll and options
      if (data.is_poll && data.poll) {
        const poll = await tx.poll.create({
          data: {
            course_announcement_id: announcement.announcement_id,
            allow_multiple_answers: data.poll.allow_multiple_answers,
            type: data.poll.type,
            options: {
              create: data.poll.options.map((optionContent) => ({
                content: optionContent,
              })),
            },
          },
        });

        // Fetch full announcement with poll
        const fullAnnouncement = await tx.course_Announcement.findUnique({
          where: { announcement_id: announcement.announcement_id },
          include: {
            poll: true,
            attachments: true,
            teacher: { include: { user: true } },
          },
        });
        return fullAnnouncement;
      }

      // Handle attachments for regular announcements
      if (!data.is_poll && data.attachments && Array.isArray(data.attachments)) {
        await tx.attachment.createMany({
          data: data.attachments.map((url) => ({
            url,
            file_type: this.determineFileType(url), // Determine file type from URL
            course_announcement_id: announcement.announcement_id,
          })),
        });
      }

      // Fetch full announcement with attachments
      const fullAnnouncement = await tx.course_Announcement.findUnique({
        where: { announcement_id: announcement.announcement_id },
        include: {
          poll: true,
          attachments: true,
          teacher: { include: { user: true } },
        },
      });

      return fullAnnouncement;
    });
  }

  async getAnnouncements(courseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const announcements = await prisma.course_Announcement.findMany({
      where: { course_id: courseId },
      skip,
      take: parseInt(limit),
      orderBy: {
        created_at: 'desc',
      },
      include: {
        poll: {
          include: {
            options: true,
            responses: true,
          },
        },
        attachments: true,
        teacher: { include: { user: true } },
        _count: { select: { comments: true } },
      },
    });
    return announcements.length > 0 ? announcements : null;
  }

  async getAnnouncementDetails(announcementId) {
    const announcement = await prisma.course_Announcement.findUnique({
      where: { announcement_id: parseInt(announcementId) },
      include: {
        poll: {
          include: {
            options: true,
            responses: true,
          },
        },
        attachments: true,
        teacher: { include: { user: true } },
        _count: { select: { comments: true } },
      },
    });
    return announcement;
  }

  async updateAnnouncement(announcementId, data) {
    return prisma.course_Announcement.update({
      where: { announcement_id: parseInt(announcementId) },
      data,
    });
  }

  async deleteAnnouncement(announcementId) {
    return prisma.course_Announcement.delete({
      where: { announcement_id: parseInt(announcementId) },
    });
  }

  // Helper method to determine file type from URL
  determineFileType(url) {
    if (url.endsWith('.pdf')) return 'pdf';
    if (url.endsWith('.doc') || url.endsWith('.docx')) return 'doc';
    if (url.match(/\.(jpeg|jpg|png|gif)$/i)) return 'img';
    if (url.endsWith('.mp4') || url.endsWith('.mov')) return 'video';
    return 'unknown'; // Updated default to 'unknown' for clarity
  }
}

export default new CourseAnnouncementService();