import prisma from '../../../common/database/prismaClient.js';

class StudentService {
  async getUserDetails(userId) {
    return prisma.user.findUnique({ where: { user_id: userId }, include: { Students: true } });
  }

  async updateUserDetails(userId, data) {
    return prisma.user.update({ where: { user_id: userId }, data });
  }

  async getNotifications(userId) {
    console.log('object')
    return prisma.notification.findMany({ where: { user_id: userId } });
  }

  async getUpcomingDeadlines(userId) {
    return prisma.assignment.findMany({
      where: { courseStudents: { some: { student_id: userId } }, due_date: { gt: new Date() } },
    });
  }

  async getEnrolledCourses(userId) {
    return prisma.course_Student.findMany({
      where: { student_id: userId },
      include: { Courses: { include: { Teachers: true } } },
    });
  }

  async getCourseDetails(courseId) {
    return prisma.course.findUnique({
      where: { course_id: courseId },
      include: { Course_Students: true },
    });
  }

  async joinCourse(studentId, courseId) {
    return prisma.course_Student.create({ data: { student_id: studentId, course_id: courseId } });
  }
}

export default new StudentService();