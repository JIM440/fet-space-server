import { nanoid } from 'nanoid';
import prisma from '../../../common/database/prismaClient.js';

class TeacherService {
  async addCourse(teacherId, data) {
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

  async addStudentToCourse(courseId, studentId) {
    return prisma.course_Student.create({
      data: {
        course: { connect: { course_id: courseId } }, // Connect to existing course
        student: { connect: { user_id: studentId } }, // Connect to existing student via user_id
      },
    });
  }

async addTeacherToCourse(courseId, teacherId) {
    // Check if the teacher is already the primary teacher to avoid duplication
    const existingCourse = await prisma.course.findUnique({
      where: { course_id: courseId },
      include: { teacher: true },
    });
    if (existingCourse?.teacher?.user_id === teacherId) {
      throw new Error('Teacher is already the primary teacher for this course');
    }

    // Check if the teacher is already a secondary teacher
    const existingTeacher = await prisma.course_Teacher.findFirst({
      where: { course_id: courseId, teacher_id: teacherId },
    });
    if (existingTeacher) {
      throw new Error('Teacher is already part of this course');
    }

    return prisma.course_Teacher.create({
      data: {
        course: { connect: { course_id: courseId } }, // Connect to existing course
        teacher: { connect: { user_id: teacherId } }, // Connect to existing teacher via user_id
      },
    });
  }

  async removeStudentFromCourse(courseId, studentId) {
    return prisma.course_Student.delete({ where: { course_id_user_id: { course_id: courseId, user_id: studentId } } });
  }

  async searchStudent(query, courseId) {
    console.log('Search Student Query Received:', query, 'Course ID:', courseId); // Debug log

    // Safeguard and log if query is empty or undefined
    if (!query || query.trim() === '') {
      console.log('Empty query, returning empty array');
      return [];
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { matricule_number: { contains: query } },
          { user: { name: { contains: query } } },
          { user: { email: { contains: query } } },
          { user: { phone_number: { contains: query } } },
        ],
      },
      include: {
        user: true, // Include all user details
        courseStudents: {
          where: { course_id: courseId }, // Check enrollment for this course
        },
      },
    });

    console.log('Raw Students Data:', students); // Debug log

    if (!students || students.length === 0) {
      console.log('No students found for query:', query);
      return [];
    }

    const mappedStudents = students.map((student) => ({
      user_id: student.user_id,
      name: student.user.name,
      email: student.user.email,
      phone_number: student.user.phone_number,
      matricule_number: student.matricule_number,
      isEnrolled: student.courseStudents.length > 0, // True if enrolled in the course
    }));

    console.log('Mapped Students:', mappedStudents); // Debug log
    return mappedStudents;
  }

  async searchTeacher(query, courseId) {
    console.log('Search Teacher Query Received:', query, 'Course ID:', courseId); // Debug log

    // Safeguard and log if query is empty or undefined
    if (!query || query.trim() === '') {
      console.log('Empty query, returning empty array');
      return [];
    }

    const teachers = await prisma.teacher.findMany({
      where: {
        OR: [
          { user: { name: { contains: query } } },
          { user: { email: { contains: query } } },
          { user: { phone_number: { contains: query } } },
        ],
      },
      include: {
        user: true, // Include all user details
        courseTeachers: { // Updated to match the model name used in addTeacherToCourse
          where: { course_id: courseId }, // Check if teacher is part of this course
        },
      },
    });

    console.log('Raw Teachers Data:', teachers); // Debug log

    if (!teachers || teachers.length === 0) {
      console.log('No teachers found for query:', query);
      return [];
    }

    const mappedTeachers = teachers.map((teacher) => ({
      user_id: teacher.user_id,
      name: teacher.user.name,
      email: teacher.user.email,
      phone_number: teacher.user.phone_number,
      isTeacher: teacher.courseTeachers.length > 0, // True if part of the course
    }));

    console.log('Mapped Teachers:', mappedTeachers); // Debug log
    return mappedTeachers;
  }

  async getMyCourses(teacherId) {
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { teacher_id: teacherId },
          { courseTeachers: { some: { teacher_id: teacherId } } }, // Updated to match model name
        ],
      },
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
    });

    if (!courses || courses.length === 0) {
      return null;
    }

    return courses;
  }

  async getCourseDetails(courseId) {
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
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
        _count: {
          select: { courseStudents: true }, // Count of students enrolled
        },
      },
    });

    if (!course) {
      return null;
    }

    // Add students count as a top-level field
    return {
      ...course,
      studentsCount: course._count.courseStudents,
    };
  }

async addCourseContent(teacherId, courseId, data) {
    const { url, file_type } = data;
    return prisma.course_Content.create({
      data: {
        url,
        file_type,
        course_id: parseInt(courseId),
        teacher_id: teacherId,
      },
    });
  }

  async addRevisionQuestions(teacherId, courseId, data) {
    const { url, file_type } = data;
    return prisma.revision_Question.create({
      data: {
        url,
        file_type,
        course_id: parseInt(courseId),
        teacher_id: teacherId,
      },
    });
  }

  generateUniqueJoinCode() {
    return nanoid(6); // 6 characters, using default alphabet (A-Za-z0-9, 62 characters)
    // Alternatively, customize alphabet for readability: const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // return nanoid(6, alphabet); // 36^6 = 2,176,782,336 combinations
  }
}

export default new TeacherService();