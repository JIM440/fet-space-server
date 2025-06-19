import prisma from '../../common/database/prismaClient.js';

class CourseService {
async createCourse(teacherId, data) {
    const { title, code, description } = data;
    let joinCode = this.generateUniqueJoinCode();

    // Ensure joinCode is unique
    let isUnique = false;
    while (!isUnique) {
      const existingCourse = await prisma.course.findUnique({ where: { join_code: joinCode } });
      if (!existingCourse) isUnique = true;
      else joinCode = this.generateUniqueJoinCode();
    }

    const course = await prisma.course.create({
      data: {
        title,
        code,
        description,
        teacher_id: teacherId,
        join_code: joinCode,
      },
    });

    return course;
  }


  async getCourseDetails(courseId) {
    return prisma.course.findUnique({
      where: { course_id: courseId },
      include: { Course_Student: { include: { Students: { include: { user: true } } } }, Teachers: { include: { user: true } } },
    });
  }

  async getStudentCourses(studentId) {
    return prisma.course_Student.findMany({
      where: { student_id: studentId },
      include: { Courses: { include: { Teachers: { include: { user: true } } } } },
    });
  }

  async addTeacherToCourse(courseId, teacherId) {
    return prisma.course_Teacher.create({ data: { course_id: courseId, teacher_id: teacherId } });
  }

  async addStudentToCourse(courseId, studentId) {
    return prisma.course_Student.create({ data: { course_id: courseId, student_id: studentId } });
  }

  async removeStudentFromCourse(courseId, studentId) {
    return prisma.course_Student.delete({ where: { course_id: courseId, student_id: studentId } });
  }

  generateUniqueJoinCode() {
    return nanoid(6); // 6 characters, using default alphabet (A-Za-z0-9, 62 characters)
    // Alternatively, customize alphabet for readability: const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // return nanoid(6, alphabet); // 36^6 = 2,176,782,336 combinations
  }
}

export default new CourseService();