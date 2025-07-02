import prisma from '../../common/database/prismaClient.js';

class NotificationService {
  async getNotifications(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const notifications = await prisma.notification.findMany({
      where: { user_id: userId },
      skip,
      take: parseInt(limit),
      orderBy: { created_at: 'desc' },
      include: {
        assignment: { include: { course: { select: { title: true, code: true, course_id: true } } } },
        course_content: { include: { course: { select: { title: true, code: true, course_id: true } } } },
        course_announcement: { include: { course: { select: { title: true, code: true, course_id: true } }, teacher: { include: { user: { select: { name: true } } } } } },
        general_announcement: { include: { admin: { include: { user: { select: { name: true } } } } } },
        revision_question: { include: { course: { select: { title: true, code: true, course_id: true } } } },
      },
    });

    if (!notifications || notifications.length === 0) return [];

    return notifications.map((notification) => {
      let type = '';
      let code = '';
      let description = notification.message;
      let image = 'https://via.placeholder.com/40';
      let routeData = { path: '', params: {} };

      if (notification.assignment_id && notification.assignment) {
        type = `Assignment (${notification.assignment.course.code})`;
        code = notification.assignment.course.code;
        description = `New assignment: ${notification.assignment.title}`;
        routeData = {
          path: `/courses/[courseId]/assignments/[assignmentId]`,
          params: { courseId: notification.assignment.course.course_id.toString(), assignmentId: notification.assignment_id.toString() },
        };
      } else if (notification.course_content_id && notification.course_content) {
        type = `Course Content (${notification.course_content.course.code})`;
        code = notification.course_content.course.code;
        description = `New content added to ${notification.course_content.course.title}`;
        routeData = {
          path: `/courses/[courseId]/content/[contentId]`,
          params: { courseId: notification.course_content.course.course_id.toString(), contentId: notification.course_content_id.toString() },
        };
      } else if (notification.course_announcement_id && notification.course_announcement) {
        type = `Course Announcement (${notification.course_announcement.course.code})`;
        code = notification.course_announcement.course.code;
        description = `Announcement: ${notification.course_announcement.title} by ${notification.course_announcement.teacher.user.name}`;
        routeData = {
          path: `/courses/[courseId]/announcements/[announcementId]`,
          params: { courseId: notification.course_announcement.course.course_id.toString(), announcementId: notification.course_announcement_id.toString() },
        };
      } else if (notification.revision_questions_id && notification.revision_question) {
        type = `Revision Question (${notification.revision_question.course.code})`;
        code = notification.revision_question.course.code;
        description = `New revision question added to ${notification.revision_question.course.title}`;
        routeData = {
          path: `/courses/[courseId]/revision-questions/[questionId]`,
          params: { courseId: notification.revision_question.course.course_id.toString(), questionId: notification.revision_questions_id.toString() },
        };
      } else if (notification.general_announcement_id && notification.general_announcement) {
        type = 'New Announcement';
        code = 'Platform';
        description = `General announcement: ${notification.general_announcement.title} by ${notification.general_announcement.admin.user.name}`;
        routeData = {
          path: `/announcement/[announcementId]`,
          params: { announcementId: notification.general_announcement_id.toString() },
        };
      } else {
        type = 'General';
        code = 'Platform';
        routeData = { path: '', params: {} };
      }

      return {
        id: notification.notification_id.toString(),
        type,
        code,
        time: notification.created_at.toISOString(),
        description,
        read: notification.is_read,
        image,
        routeData,
      };
    });
  }

  async markNotificationAsRead(notificationId, userId) {
    const notification = await prisma.notification.findUnique({
      where: { notification_id: parseInt(notificationId) },
    });
    if (!notification || notification.user_id !== userId) {
      throw new Error('Notification not found or unauthorized');
    }

    return prisma.notification.update({
      where: { notification_id: parseInt(notificationId) },
      data: { is_read: true },
    });
  }
}

export default new NotificationService();