import prisma from '../../../common/database/prismaClient.js';

class TeacherService {
  async addCourse(teacherId, data) {
    return prisma.course.create({ data: { ...data, user_id: teacherId } });
  }

  async addStudentToCourse(courseId, studentId) {
    return prisma.course_Student.create({ data: { course_id: courseId, user_id: studentId } });
  }

  async removeStudentFromCourse(courseId, studentId) {
    return prisma.course_Student.delete({ where: { course_id_user_id: { course_id: courseId, user_id: studentId } } });
  }

  async searchStudent(query) {
    return prisma.student.findMany({
      where: { OR: [{ matricule_number: { contains: query } }, { user: { name: { contains: query } } }] },
    });
  }

  async searchTeacher(query) {
    return prisma.teacher.findMany({
      where: { user: { name: { contains: query } } },
    });
  }

  async getMyCourses(teacherId) {
    return prisma.course.findMany({
      where: { OR: [{ user_id: teacherId }, { Course_Teachers: { some: { user_id: teacherId } } }] },
    });
  }
}

export default new TeacherService();