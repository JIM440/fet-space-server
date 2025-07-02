import { nanoid } from "nanoid";
import prisma from "../../../common/database/prismaClient.js";
import SocketService from "../../../common/utils/socket.service.js";

class TeacherService {
  async addCourse(teacherId, data) {
    const { title, code, description } = data;
    let joinCode = this.generateUniqueJoinCode();

    let isUnique = false;
    while (!isUnique) {
      const existingCourse = await prisma.course.findUnique({
        where: { join_code: joinCode },
      });
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
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { title: true },
    });
    if (!course) throw new Error("Course not found");

    const result = await prisma.$transaction(async (tx) => {
      const courseStudent = await tx.course_Student.create({
        data: {
          course: { connect: { course_id: courseId } },
          student: { connect: { user_id: studentId } },
        },
      });

      await tx.notification.create({
        data: {
          user_id: studentId,
          message: `You have been added to the course: ${course.title}`,
          is_read: false,
        },
      });

      return courseStudent;
    });

    SocketService.emitEvent(`course_${courseId}`, "newCourseMember", {
      userId: studentId,
      role: "Student",
      courseId,
      message: `Student added to course: ${course.title}`,
    });

    return result;
  }

  async addTeacherToCourse(courseId, teacherId) {
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      select: { title: true, teacher_id: true },
    });
    if (!course) throw new Error("Course not found");
    if (course.teacher_id === teacherId)
      throw new Error("Teacher is already the primary teacher for this course");

    const existingTeacher = await prisma.course_Teacher.findFirst({
      where: { course_id: courseId, teacher_id: teacherId },
    });
    if (existingTeacher)
      throw new Error("Teacher is already part of this course");

    const result = await prisma.$transaction(async (tx) => {
      const courseTeacher = await tx.course_Teacher.create({
        data: {
          course: { connect: { course_id: courseId } },
          teacher: { connect: { user_id: teacherId } },
        },
      });

      await tx.notification.create({
        data: {
          user_id: teacherId,
          message: `You have been added as a teacher to the course: ${course.title}`,
          is_read: false,
        },
      });

      return courseTeacher;
    });

    SocketService.emitEvent(`course_${courseId}`, "newCourseMember", {
      userId: teacherId,
      role: "Teacher",
      courseId,
      message: `Teacher added to course: ${course.title}`,
    });

    return result;
  }

  async removeStudentFromCourse(courseId, studentId) {
    return prisma.course_Student.delete({
      where: { course_id_user_id: { course_id: courseId, user_id: studentId } },
    });
  }

  async searchStudent(query, courseId) {
    if (!query || query.trim() === "") return [];

    const students = await prisma.student.findMany({
      where: {
        OR: [
          { matricule_number: { contains: query } },
          { user: { name: { contains: query } } },
          { user: { phone_number: { contains: query } } },
        ],
      },
      include: {
        user: true,
        courseStudents: { where: { course_id: courseId } },
      },
    });

    if (!students || students.length === 0) return [];

    return students.map((student) => ({
      user_id: student.user_id,
      name: student.user.name,
      email: student.user.email,
      phone_number: student.user.phone_number,
      matricule_number: student.matricule_number,
      isEnrolled: student.courseStudents.length > 0,
    }));
  }

  async searchTeacher(query, courseId) {
    if (!query || query.trim() === "") return [];

    const teachers = await prisma.teacher.findMany({
      where: {
        OR: [
          { user: { name: { contains: query } } },
          { user: { email: { contains: query } } },
          { user: { phone_number: { contains: query } } },
        ],
      },
      include: {
        user: true,
        courseTeachers: { where: { course_id: courseId } },
      },
    });

    if (!teachers || teachers.length === 0) return [];

    return teachers.map((teacher) => ({
      user_id: teacher.user_id,
      name: teacher.user.name,
      email: teacher.user.email,
      phone_number: teacher.user.phone_number,
      isTeacher: teacher.courseTeachers.length > 0,
    }));
  }

  async getMyCourses(teacherId) {
    const courses = await prisma.course.findMany({
      where: {
        OR: [
          { teacher_id: teacherId },
          { courseTeachers: { some: { teacher_id: teacherId } } },
        ],
      },
      include: {
        teacher: {
          include: {
            user: { select: { name: true, email: true, phone_number: true } },
          },
        },
      },
    });

    return courses.length > 0 ? courses : null;
  }

  async getCourseDetails(courseId) {
    const course = await prisma.course.findUnique({
      where: { course_id: courseId },
      include: {
        teacher: {
          include: {
            user: { select: { name: true, email: true, phone_number: true } },
          },
        },
        _count: { select: { courseStudents: true } },
      },
    });

    if (!course) return null;

    return {
      ...course,
      studentsCount: course._count.courseStudents,
    };
  }

  async addCourseContent(teacherId, courseId, data) {
    const { url, file_type } = data;
    const course = await prisma.course.findUnique({
      where: { course_id: parseInt(courseId) },
      select: { title: true },
    });
    if (!course) throw new Error("Course not found");

    const result = await prisma.$transaction(async (tx) => {
      const content = await tx.course_Content.create({
        data: { course_id: parseInt(courseId) },
      });

      await tx.attachment.create({
        data: {
          url,
          file_type,
          course_content_id: content.content_id,
        },
      });

      const users = await tx.course.findUnique({
        where: { course_id: parseInt(courseId) },
        include: {
          courseStudents: { include: { student: true } },
          courseTeachers: { include: { teacher: true } },
        },
      });

      const notificationData = [
        ...users.courseStudents.map((cs) => ({
          user_id: cs.student.user_id,
          message: `New content added to course: ${course.title}`,
          is_read: false,
          course_content_id: content.content_id,
        })),
        ...users.courseTeachers.map((ct) => ({
          user_id: ct.teacher.user_id,
          message: `New content added to course: ${course.title}`,
          is_read: false,
          course_content_id: content.content_id,
        })),
      ];

      if (notificationData.length > 0) {
        await tx.notification.createMany({ data: notificationData });
      }

      return content;
    });

    SocketService.emitEvent(`course_${courseId}`, "newCourseContent", {
      contentId: result.content_id,
      courseId,
      message: `New content added to course: ${course.title}`,
    });

    return result;
  }

  async addRevisionQuestions(teacherId, courseId, data) {
    const { url, file_type } = data;
    const course = await prisma.course.findUnique({
      where: { course_id: parseInt(courseId) },
      select: { title: true },
    });
    if (!course) throw new Error("Course not found");

    const result = await prisma.$transaction(async (tx) => {
      const question = await tx.revision_Question.create({
        data: { course_id: parseInt(courseId) },
      });

      await tx.attachment.create({
        data: {
          url,
          file_type,
          revision_questions_id: question.question_id,
        },
      });

      const users = await tx.course.findUnique({
        where: { course_id: parseInt(courseId) },
        include: {
          courseStudents: { include: { student: true } },
          courseTeachers: { include: { teacher: true } },
        },
      });

      const notificationData = [
        ...users.courseStudents.map((cs) => ({
          user_id: cs.student.user_id,
          message: `New revision question added to course: ${course.title}`,
          is_read: false,
          revision_questions_id: question.question_id,
        })),
        ...users.courseTeachers.map((ct) => ({
          user_id: ct.teacher.user_id,
          message: `New revision question added to course: ${course.title}`,
          is_read: false,
          revision_questions_id: question.question_id,
        })),
      ];

      if (notificationData.length > 0) {
        await tx.notification.createMany({ data: notificationData });
      }

      return question;
    });

    SocketService.emitEvent(`course_${courseId}`, "newRevisionQuestion", {
      questionId: result.question_id,
      courseId,
      message: `New revision question added to course: ${course.title}`,
    });

    return result;
  }

  async deleteCourseContent(teacherId, contentId) {
    const content = await prisma.course_Content.findUnique({
      where: { content_id: contentId },
      include: { course: true },
    });

    if (!content || content.course.teacher_id !== teacherId) {
      throw new Error("Unauthorized or content not found");
    }

    await prisma.attachment.deleteMany({
      where: { course_content_id: contentId },
    });
    const deletedContent = await prisma.course_Content.delete({
      where: { content_id: contentId },
    });

    return deletedContent;
  }

  async deleteRevisionQuestions(teacherId, questionId) {
    const question = await prisma.revision_Question.findUnique({
      where: { question_id: questionId },
      include: { course: true },
    });

    if (!question || question.course.teacher_id !== teacherId) {
      throw new Error("Unauthorized or question not found");
    }

    await prisma.attachment.deleteMany({
      where: { revision_questions_id: questionId },
    });
    const deletedQuestion = await prisma.revision_Question.delete({
      where: { question_id: questionId },
    });

    return deletedQuestion;
  }

  async createAssignment(teacherId, courseId, data) {
    const { title, description, due_date, attachments } = data;
    const parsedCourseId = parseInt(courseId);
    if (isNaN(parsedCourseId)) throw new Error("Invalid course ID");

    const course = await prisma.course.findUnique({
      where: { course_id: parsedCourseId },
      select: { title: true },
    });
    if (!course) throw new Error("Course not found");

    const teacher = await prisma.user.findUnique({
      where: { user_id: teacherId, role: "Teacher" },
    });
    if (!teacher) throw new Error("Teacher not found or unauthorized");

    const result = await prisma.$transaction(async (tx) => {
      const assignment = await tx.assignment.create({
        data: {
          course: { connect: { course_id: parsedCourseId } },
          teacher: { connect: { user_id: teacherId } },
          title,
          description,
          due_date: new Date(due_date),
          attachments: {
            create: attachments.map((attach) => ({
              url: attach.url,
              file_type: attach.file_type,
            })),
          },
        },
      });

      const users = await tx.course.findUnique({
        where: { course_id: parsedCourseId },
        include: { courseStudents: { include: { student: true } } },
      });

      const notificationData = users.courseStudents.map((cs) => ({
        user_id: cs.student.user_id,
        message: `New assignment "${title}" added to course: ${course.title}`,
        is_read: false,
        assignment_id: assignment.assignment_id,
      }));

      if (notificationData.length > 0) {
        await tx.notification.createMany({ data: notificationData });
      }

      return assignment;
    });

    SocketService.emitEvent(`course_${courseId}`, "newAssignment", {
      assignmentId: result.assignment_id,
      courseId,
      title,
      message: `New assignment "${title}" added to course: ${course.title}`,
    });

    return result;
  }

  async updateAssignment(teacherId, assignmentId, data) {
    const { title, description, due_date, attachments } = data;
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: parseInt(assignmentId) },
      include: { course: true },
    });

    if (!assignment || assignment.teacher_id !== teacherId) {
      throw new Error("Unauthorized or assignment not found");
    }

    await prisma.attachment.deleteMany({
      where: { assignment_id: assignmentId },
    });

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
      throw new Error("Unauthorized or assignment not found");
    }

    await prisma.assignment_Submission.deleteMany({
      where: { assignment_id: assignmentId },
    });
    await prisma.attachment.deleteMany({
      where: { assignment_id: assignmentId },
    });

    const deletedAssignment = await prisma.assignment.delete({
      where: { assignment_id: assignmentId },
    });

    return deletedAssignment;
  }

  async getAssignmentDetailsForTeacher(assignmentId) {
    const assignment = await prisma.assignment.findUnique({
      where: { assignment_id: parseInt(assignmentId) },
      include: {
        teacher: { include: { user: { select: { name: true, role: true } } } },
        attachments: true,
        submissions: {
          include: {
            student: { include: { user: { select: { name: true } } } },
            attachments: true,
          },
          orderBy: { submitted_at: "asc" },
        },
      },
    });

    if (!assignment) return null;

    const totalSubmissions = assignment.submissions.length;
    const submissionsWithStatus = assignment.submissions.map((submission) => {
      const dueDate = new Date(assignment.due_date);
      const submittedAt = new Date(submission.submitted_at);
      const isLate = dueDate && submittedAt > dueDate;
      const timeStatus = isLate
        ? { text: "Late", color: "red" }
        : { text: "Early", color: "black" };
      return {
        studentId: submission.student_id,
        studentName: submission.student.user.name,
        studentMatricule: submission.student.user.matricule_number,
        submittedAt: submission.submitted_at,
        comment: submission.comment || "No comment",
        attachments: submission.attachments.map((a) => ({
          url: a.url,
          file_type: a.file_type,
        })),
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
      attachments: assignment.attachments.map((a) => ({
        url: a.url,
        file_type: a.file_type,
      })),
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
        due_date: "asc", // Order by closeness to deadline
      },
    });

    return assignments.map((assignment) => ({
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
