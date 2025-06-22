import prisma from '../../../common/database/prismaClient.js';

class StudentService {
  async getUserDetails(userId) {
    return prisma.user.findUnique({ where: { user_id: userId }, include: { student: true } });
  }

  async updateUserDetails(userId, data) {
    return prisma.user.update({ where: { user_id: userId }, data });
  }

  async getNotifications(userId) {
    return prisma.notification.findMany({ where: { user_id: userId } });
  }

async getUpcomingDeadlines(userId) {
    return prisma.assignment.findMany({
      where: {
        course: {
          courseStudents: {
            some: {
              student_id: userId, // Filter assignments for courses the student is enrolled in
            },
          },
        },
        due_date: {
          gt: new Date(), // Assignments with due dates after now
        },
      },
    });
  }

  async getEnrolledCourses(studentId) {
      const studentCourses= await prisma.course_Student.findMany({
      where: { student_id: studentId },
      include: {
        course: {
          include: {
            teacher: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true,
                    phone_number: true,
                  },
                },
              },
            },
            courseTeachers: {
              include: {
                teacher: {
                  include: {
                    user: {
                      select: {
                        name: true,
                        email: true,
                        phone_number: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    });
    return studentCourses
  }

  async joinCourse(studentId, { courseId, join_code }) {
    // Validate join code
    console.log(join_code)
    const course = await prisma.course.findUnique({ where: { join_code } });
    if (!course) {
      throw new Error('Invalid join code');
    }

    const result = await prisma.course_Student.create({ data: { student_id: studentId, course_id: course.course_id } });

    return result;
  }

}

export default new StudentService();