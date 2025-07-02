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

  async getAssignmentDetailsForStudent(assignmentId, studentId) {
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: parseInt(assignmentId) },
      include: {
        teacher: {
          include: { user: { select: { name: true, role: true } } },
        },
        attachments: true,
        submissions: {
          where: { student_id: studentId },
          include: { attachments: true },
        },
      },
    });

    if (!assignment) {
      return null;
    }

    const studentSubmission = assignment.submissions[0]; // Get the student's submission
    const dueDate = new Date(assignment.due_date);
    const submittedAt = studentSubmission ? new Date(studentSubmission.submitted_at) : null;
    const isLate = dueDate && submittedAt && submittedAt > dueDate;
    const timeStatus = isLate ? 'Late' : 'Early';

    return {
      assignment_id: assignment.assignment_id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      created_at: assignment.created_at,
      attachments: assignment.attachments.map(a => ({ url: a.url, file_type: a.file_type })),
      submission: studentSubmission
        ? {
            submission_id: studentSubmission.submission_id,
            submitted_at: studentSubmission.submitted_at,
            comment: studentSubmission.comment || 'No comment',
            attachments: studentSubmission.attachments.map(a => ({ url: a.url, file_type: a.file_type })),
            status: timeStatus,
          }
        : null,
    };
  }

  async submitAssignment(studentId, assignmentId, data) {
    const { attachments, comment } = data;
    const assignment = await prisma.assignment.findUnique({
      
      where: { assignment_id: parseInt(assignmentId) },
    });
    if (!assignment) {
      throw new Error('Assignment not found');
    }

    const existingSubmission = await prisma.assignment_Submission.findFirst({
      where: { assignment_id: parseInt(assignmentId), student_id: studentId },
    });

    if (existingSubmission) {
      return prisma.assignment_Submission.update({
        where: { submission_id: existingSubmission.submission_id },
        data: {
          submitted_at: new Date(), // Update submission time
          comment,
          attachments: {
            create: attachments.map(attach => ({
              url: attach.url,
              file_type: attach.file_type,
            })),
          },
        },
      });
    }

    return prisma.assignment_Submission.create({
      data: {
        assignment_id: parseInt(assignmentId),
        student_id: studentId,
        submitted_at: new Date(),
        comment,
        attachments: {
          create: attachments.map(attach => ({
            url: attach.url,
            file_type: attach.file_type,
          })),
        },
      },
    });
  }

  async getUpcomingDeadlinesForStudent(studentId) {
    const currentDate = new Date();
    const assignments = await prisma.assignment.findMany({
      where: {
        course: {
          courseStudents: {
            some: {
              student_id: studentId,
            },
          },
        },
        due_date: {
          gt: currentDate, // Only future due dates
        },
      },
      include: {
        course: true,
      },
      orderBy: {
        due_date: 'asc',
      },
    });

    return assignments.map(assignment => ({
      assignment_id: assignment.assignment_id,
      title: assignment.title,
      description: assignment.description,
      due_date: assignment.due_date,
      course_title: assignment.course.title,
    }));
  }

}

export default new StudentService();