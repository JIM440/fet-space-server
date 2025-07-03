import prisma from "../../../common/database/prismaClient.js";
import SocketService from "../../../common/utils/socket.service.js";

class CourseAnnouncementService {
  async createAnnouncement(teacherId, courseId, data) {
    // Input validation
    if (!data.title || !data.content) {
      throw new Error("Title and content are required");
    }

    // Verify course exists
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { title: true },
    });
    if (!course) throw new Error("Course not found");

    return prisma.$transaction(async (tx) => {
      try {
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
          await tx.poll.create({
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
        }

        // Handle attachments for regular announcements
        if (
          !data.is_poll &&
          data.attachments &&
          Array.isArray(data.attachments)
        ) {
          await tx.attachment.createMany({
            data: data.attachments.map((url) => ({
              url,
              file_type: this.determineFileType(url),
              course_announcement_id: announcement.announcement_id,
            })),
          });
        }

        // Fetch only students enrolled in the course for notifications
        const courseStudents = await tx.course_Student.findMany({
          where: { course_id: courseId },
          include: { student: true },
        });

        console.log(courseStudents)

        if (courseStudents.length === 0) {
          console.warn(
            "No students found to notify for announcement ID:",
            announcement.announcement_id
          );
        }

        // Create notifications for students only
        const notificationData = courseStudents.map((cs) => ({
          user_id: cs.student.user_id,
          message:
            data.notificationMessage ||
            `New announcement "${data.title}" in course: ${course.title}`,
          is_read: false,
          course_announcement_id: announcement.announcement_id,
        }));

        // Batch notification creation for scalability
        const batchSize = 1000;
        for (let i = 0; i < notificationData.length; i += batchSize) {
          await tx.notification.createMany({
            data: notificationData.slice(i, i + batchSize),
          });
        }

        // Fetch full announcement for return and socket event
        const fullAnnouncement = await tx.course_Announcement.findUnique({
          where: { announcement_id: announcement.announcement_id },
          include: {
            poll: { include: { options: true, responses: true } },
            attachments: true,
            teacher: { include: { user: true } },
          },
        });

        // Emit socket event to course-specific channel
        SocketService.emitEvent(`course_${courseId}`, "newAnnouncement", {
          ...fullAnnouncement,
          message:
            notificationData[0]?.message ||
            `New announcement "${data.title}" in course: ${course.title}`,
        });

        return fullAnnouncement;
      } catch (error) {
        console.error("Failed to create course announcement:", error);
        throw new Error("Course announcement creation failed");
      }
    });
  }

  async getAnnouncements(courseId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const announcements = await prisma.course_Announcement.findMany({
      where: { course_id: courseId },
      skip,
      take: parseInt(limit),
      orderBy: { created_at: "desc" },
      include: {
        poll: { include: { options: true, responses: true } },
        attachments: true,
        teacher: { include: { user: true } },
        _count: { select: { comments: true } },
      },
    });
    console.log(announcements)
    return announcements.length > 0 ? announcements : [];
  }

  async getAnnouncementDetails(announcementId) {
    const announcement = await prisma.course_Announcement.findUnique({
      where: { announcement_id: parseInt(announcementId) },
      include: {
        poll: { include: { options: true, responses: true } },
        attachments: true,
        teacher: { include: { user: true } },
        _count: { select: { comments: true } },
      },
    });
    return announcement;
  }

  async updateAnnouncement(announcementId, data) {
    // Verify announcement exists
    const announcement = await prisma.course_Announcement.findUnique({
      where: { announcement_id: parseInt(announcementId) },
      include: { course: { select: { title: true } } },
    });
    if (!announcement) throw new Error("Announcement not found");

    return prisma.$transaction(async (tx) => {
      try {
        // Update the announcement
        const updatedAnnouncement = await tx.course_Announcement.update({
          where: { announcement_id: parseInt(announcementId) },
          data,
        });

        // Notify students if title or content changed
        if (data.title || data.content) {
          const courseStudents = await tx.course_Student.findMany({
            where: { course_id: announcement.course_id },
            include: { student: true },
          });

          if (courseStudents.length === 0) {
            console.warn(
              "No students found to notify for announcement ID:",
              announcement.announcement_id
            );
          }

          const notificationData = courseStudents.map((cs) => ({
            user_id: cs.student.user_id,
            message:
              data.notificationMessage ||
              `Announcement "${
                data.title || announcement.title
              }" updated in course: ${announcement.course.title}`,
            is_read: false,
            course_announcement_id: announcement.announcement_id,
          }));

          // Batch notification creation
          const batchSize = 1000;
          for (let i = 0; i < notificationData.length; i += batchSize) {
            await tx.notification.createMany({
              data: notificationData.slice(i, i + batchSize),
            });
          }

          // Fetch full announcement for return and socket event
          const fullAnnouncement = await tx.course_Announcement.findUnique({
            where: { announcement_id: parseInt(announcementId) },
            include: {
              poll: { include: { options: true, responses: true } },
              attachments: true,
              teacher: { include: { user: true } },
            },
          });

          // Emit socket event
          SocketService.emitEvent(
            `course_${announcement.course_id}`,
            "updateAnnouncement",
            {
              ...fullAnnouncement,
              message:
                notificationData[0]?.message ||
                `Announcement "${
                  data.title || announcement.title
                }" updated in course: ${announcement.course.title}`,
            }
          );

          return fullAnnouncement;
        }

        return updatedAnnouncement;
      } catch (error) {
        console.error("Failed to update course announcement:", error);
        throw new Error("Course announcement update failed");
      }
    });
  }

  async deleteAnnouncement(announcementId) {
    return prisma.course_Announcement.delete({
      where: { announcement_id: parseInt(announcementId) },
    });
  }

  determineFileType(url) {
    if (url.endsWith(".pdf")) return "pdf";
    if (url.endsWith(".doc") || url.endsWith(".docx")) return "doc";
    if (url.match(/\.(jpeg|jpg|png|gif)$/i)) return "img";
    if (url.endsWith(".mp4") || url.endsWith(".mov")) return "video";
    return "unknown";
  }
}

export default new CourseAnnouncementService();
