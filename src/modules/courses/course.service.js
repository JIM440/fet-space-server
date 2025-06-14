import prisma from '../../common/database/prismaClient.js';

class CourseService {
  async createCourse(teacherId, data) {
    return prisma.course.create({ data: { ...data, teacher_id: teacherId } });
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
}

export default new CourseService();