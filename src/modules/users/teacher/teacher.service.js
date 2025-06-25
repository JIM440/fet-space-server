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
    if (!query || query.trim() === '') {
      console.log('Empty query, returning empty array');
      return [];
    }

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { matricule_number: { contains: query } },
          { user: { name: { contains: query } } },
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
    const content = await prisma.course_Content.create({
      data: {
        course_id: parseInt(courseId),
      },
    });

    await prisma.attachment.create({
      data: {
        url,
        file_type,
        course_content_id: content.content_id,
      },
    });

    return content;
  }

  async addRevisionQuestions(teacherId, courseId, data) {
    const { url, file_type } = data;
    const question = await prisma.revision_Question.create({
      data: {
        course_id: parseInt(courseId),
      },
    });

    await prisma.attachment.create({
      data: {
        url,
        file_type,
        revision_questions_id: question.question_id,
      },
    });

    return question;
  }

  async deleteCourseContent(teacherId, contentId) {
    // Verify the teacher is the creator or has permission
    const content = await prisma.course_Content.findUnique({
      where: { content_id: contentId },
      include: { course: true },
    });

    if (!content || content.course.teacher_id !== teacherId) {
      throw new Error('Unauthorized or content not found');
    }

    // Delete the attachment first (due to cascade or manual deletion)
    await prisma.attachment.deleteMany({
      where: { course_content_id: contentId },
    });

    // Delete the content
    const deletedContent = await prisma.course_Content.delete({
      where: { content_id: contentId },
    });

    return deletedContent;
  }

  async deleteRevisionQuestions(teacherId, questionId) {
    // Verify the teacher is the creator or has permission
    const question = await prisma.revision_Question.findUnique({
      where: { question_id: questionId },
      include: { course: true },
    });

    if (!question || question.course.teacher_id !== teacherId) {
      throw new Error('Unauthorized or question not found');
    }

    // Delete the attachment first
    await prisma.attachment.deleteMany({
      where: { revision_questions_id: questionId },
    });

    // Delete the question
    const deletedQuestion = await prisma.revision_Question.delete({
      where: { question_id: questionId },
    });

    return deletedQuestion;
  }

async createAssignment(teacherId, courseId, data) {
    const { title, description, due_date, attachments } = data;

    // Validate and parse courseId
    const parsedCourseId = parseInt(courseId);
    if (isNaN(parsedCourseId)) {
      throw new Error('Invalid course ID');
    }

    // Check if the course exists
    const course = await prisma.course.findUnique({
      where: { course_id: parsedCourseId },
    });
    if (!course) {
      throw new Error('Course not found');
    }

    // Validate teacher
    const teacher = await prisma.user.findUnique({
      where: { user_id: teacherId, role: 'Teacher' },
    });
    if (!teacher) {
      throw new Error('Teacher not found or unauthorized');
    }

    const assignment = await prisma.assignment.create({
      data: {
        course: {
          connect: { course_id: parsedCourseId }, // Connect to existing course
        },
        teacher: {
          connect: { user_id: teacherId }, // Explicitly connect teacher
        },
        title,
        description,
        due_date: new Date(due_date), // Ensure proper Date object
        attachments: {
          create: attachments.map((attach) => ({
            url: attach.url,
            file_type: attach.file_type,
          })),
        },
      },
    });

    return assignment;
  }

  async updateAssignment(teacherId, assignmentId, data) {
    const { title, description, due_date, attachments } = data;
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: parseInt(assignmentId) },
      include: { course: true },
    });

    if (!assignment || assignment.teacher_id !== teacherId) {
      throw new Error('Unauthorized or assignment not found');
    }

    // Delete existing attachments
    await prisma.attachment.deleteMany({ where: { assignment_id: assignmentId } });

    const updatedAssignment = await prisma.assignment.update({
      where: { assignment_id: assignmentId },
      data: {
        title,
        description,
        due_date,
        attachments: {
          create: attachments.map((attach) => ({
            url: attach.url,
            file_type: attach.file_type,
          })),
        },
      },
    });

    return updatedAssignment;
  }

  async deleteAssignment(teacherId, assignmentId) {
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: parseInt(assignmentId) },
      include: { course: true },
    });

    if (!assignment || assignment.teacher_id !== teacherId) {
      throw new Error('Unauthorized or assignment not found');
    }

    // Delete submissions and their attachments
    await prisma.assignment_Submission.deleteMany({ where: { assignment_id: assignmentId } });
    // Delete assignment attachments
    await prisma.attachment.deleteMany({ where: { assignment_id: assignmentId } });

    const deletedAssignment = await prisma.assignment.delete({
      where: { assignment_id: assignmentId },
    });

    return deletedAssignment;
  }

  async getAssignmentDetailsForTeacher(assignmentId) {
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: parseInt(assignmentId) },
      include: {
        teacher: {
          include: { user: { select: { name: true, role: true } } },
        },
        attachments: true,
        submissions: {
          include: {
            student: {
              include: { user: { select: { name: true } } },
            },
            attachments: true,
          },
          orderBy: { submitted_at: 'asc' }, // Order by submission time (earliest first)
        },
      },
    });

    if (!assignment) {
      return null;
    }

    const totalSubmissions = assignment.submissions.length;
    const submissionsWithStatus = assignment.submissions.map(submission => {
      const dueDate = new Date(assignment.due_date);
      const submittedAt = new Date(submission.submitted_at);
      const isLate = dueDate && submittedAt > dueDate;
      const timeStatus = isLate ? { text: 'Late', color: 'red' } : { text: 'Early', color: 'black' };
      return {
        studentId: submission.student_id,
        studentName: submission.student.user.name,
        submittedAt: submission.submitted_at,
        comment: submission.comment || 'No comment',
        attachments: submission.attachments.map(a => ({ url: a.url, file_type: a.file_type })),
        status: timeStatus.text,
        statusColor: timeStatus.color,
      };
    });

    return {
      assignment_id: assignment.assignment_id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      created_at: assignment.created_at,
      attachments: assignment.attachments.map(a => ({ url: a.url, file_type: a.file_type })),
      totalSubmissions,
      submissions: submissionsWithStatus,
    };
  }

  async getUpcomingDeadlinesForTeacher(teacherId) {
    const currentDate = new Date();
    const assignments = await prisma.assignment.findMany({
      where: {
        teacher_id: teacherId,
        due_date: {
          gt: currentDate, // Only future due dates
        },
      },
      include: {
        course: true,
      },
      orderBy: {
        due_date: 'asc', // Order by closeness to deadline
      },
    });

    return assignments.map(assignment => ({
      assignment_id: assignment.assignment_id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      courseId: assignment.course.course_id,
      course_title: assignment.course.title,
      course_code: assignment.course.code,
    }));
  }

  generateUniqueJoinCode() {
    return nanoid(6); // 6 characters, using default alphabet (A-Za-z0-9, 62 characters)
    // Alternatively, customize alphabet for readability: const alphabet = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    // return nanoid(6, alphabet); // 36^6 = 2,176,782,336 combinations
  }
}

export default new TeacherService();