import prisma from '../../common/database/prismaClient.js';
import { nanoid } from 'nanoid'; // Assuming nanoid is imported

class CourseService {
  async getCourseDetails(courseId) {
    const course = await prisma.course.findUnique({
      where: { course_id: parseInt(courseId) },
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

  async getCoursePersons(courseId) {
    const course = await prisma.course.findUnique({
      where: { course_id: parseInt(courseId) },
      include: {
        courseStudents: {
          include: {
            student: {
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
    });

    if (!course) {
      return null;
    }

    // Transform the response for cleaner data
    return {
      students: course.courseStudents.map(cs => ({
        id: cs.student_id,
        name: cs.student.user.name,
        email: cs.student.user.email,
        phone_number: cs.student.user.phone_number,
        role: 'Student',
      })),
      teachers: [
        {
          id: course.teacher.user_id,
          name: course.teacher.user.name,
          email: course.teacher.user.email,
          phone_number: course.teacher.user.phone_number,
          role: 'Teacher',
        },
        ...course.courseTeachers.map(ct => ({
          id: ct.teacher.user_id,
          name: ct.teacher.user.name,
          email: ct.teacher.user.email,
          phone_number: ct.teacher.user.phone_number,
          role: 'Teacher',
        })),
      ],
    };
  }

  async getCourseAssignments(courseId) {
    const assignments = await prisma.assignment.findMany({
      where: { course_id: parseInt(courseId) },
    });
    return assignments.length > 0 ? assignments : null;
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

async getCourseContents(courseId) {
    const contents = await prisma.course_Content.findMany({
      where: { course_id: parseInt(courseId) },
      include: {
        course: {
          include: {
            teacher: {
              include: { user: true },
            },
          },
        },
        attachments: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
    return contents;
  }

  async getCourseRevisionQuestions(courseId) {
    const revisionQuestions = await prisma.revision_Question.findMany({
      where: { course_id: parseInt(courseId) },
      include: {
        course: {
          include: {
            teacher: {
              include: { user: true },
            },
          },
        },
        attachments: true, // Fetch url and file_type from Attachment, including images
      },
      orderBy: {
        created_at: 'desc', // Sort by created_at in descending order (most recent first)
      },
    });
    return revisionQuestions;
  }

  generateUniqueJoinCode() {
    return nanoid(6); // 6 characters, using default alphabet (A-Za-z0-9, 62 characters)
    // Alternatively, customize alphabet for readability: const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // return nanoid(6, alphabet); // 36^6 = 2,176,782,336 combinations
  }
}

export default new CourseService();