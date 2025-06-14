import prisma from '../../../common/database/prismaClient.js';

class AdminService {
  async getAllStudents(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.student.findMany({
      skip,
      take: limit,
      include: { user: true },
    });
  }

  async searchStudents(query) {
    return prisma.student.findMany({
      where: { user: { name: { contains: query } } },
      include: { user: true },
    });
  }

  async getAllTeachers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.teacher.findMany({
      skip,
      take: limit,
      include: { user: true },
    });
  }

  async searchTeacher(query) {
    return prisma.teacher.findMany({
      where: { user: { name: { contains: query } } },
      include: { user: true },
    });
  }

  async addStudent(studentData) {
    return prisma.$transaction(async (tx) => {
      // Check if email already exists
      const existingUser = await tx.user.findUnique({
        where: { email: studentData.email },
      });
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const user = await tx.user.create({
        data: {
          name: studentData.name,
          email: studentData.email,
          password: studentData.password, // Ensure this is hashed before passing
          role: 'Student',
          phone_number: studentData.phone_number,
        },
      });
      const student = await tx.student.create({
        data: {
          user_id: user.user_id,
          matricule_number: studentData.matricule_number,
          nationality: studentData.nationality,
          level: studentData.level,
          institutional_email: studentData.institutional_email,
        },
      });
      // Return both user and student details
      return { ...user, ...student };
    });
  }

  async addMultipleStudents(studentsData) {
    return prisma.$transaction(async (tx) => {
      const students = await Promise.all(
        studentsData.map(async (student) => {
          // Check if email already exists
          const existingUser = await tx.user.findUnique({
            where: { email: student.email },
          });
          if (existingUser) {
            throw new Error(`Email ${student.email} already exists`);
          }

          const user = await tx.user.create({
            data: {
              name: student.name,
              email: student.email,
              password: student.password, // Ensure this is hashed before passing
              role: 'Student',
              phone_number: student.phone_number,
            },
          });
          const createdStudent = await tx.student.create({
            data: {
              user_id: user.user_id,
              matricule_number: student.matricule_number,
              nationality: student.nationality,
              level: student.level,
              institutional_email: student.institutional_email,
            },
          });
          // Return both user and student details
          return { ...user, ...createdStudent };
        })
      );
      return students;
    });
  }

  async addTeacher(teacherData) {
    return prisma.$transaction(async (tx) => {
      // Check if email already exists
      const existingUser = await tx.user.findUnique({
        where: { email: teacherData.email },
      });
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const user = await tx.user.create({
        data: {
          name: teacherData.name,
          email: teacherData.email,
          password: teacherData.password, // Ensure this is hashed before passing
          role: 'Teacher',
          phone_number: teacherData.phone_number,
        },
      });
      const teacher = await tx.teacher.create({
        data: {
          user_id: user.user_id,
        },
      });
      // Return both user and teacher details
      return { ...user, ...teacher };
    });
  }

  async addMultipleTeachers(teachersData) {
    return prisma.$transaction(async (tx) => {
      const teachers = await Promise.all(
        teachersData.map(async (teacher) => {
          // Check if email already exists
          const existingUser = await tx.user.findUnique({
            where: { email: teacher.email },
          });
          if (existingUser) {
            throw new Error(`Email ${teacher.email} already exists`);
          }

          const user = await tx.user.create({
            data: {
              name: teacher.name,
              email: teacher.email,
              password: teacher.password, // Ensure this is hashed before passing
              role: 'Teacher',
              phone_number: teacher.phone_number,
            },
          });
          const createdTeacher = await tx.teacher.create({
            data: {
              user_id: user.user_id,
            },
          });
          // Return both user and teacher details
          return { ...user, ...createdTeacher };
        })
      );
      return teachers;
    });
  }

  async addAdmin(adminData) {
    return prisma.$transaction(async (tx) => {
      // Check if email already exists
      const existingUser = await tx.user.findUnique({
        where: { email: adminData.email },
      });
      if (existingUser) {
        throw new Error('Email already exists');
      }

      const user = await tx.user.create({
        data: {
          name: adminData.name,
          email: adminData.email,
          password: adminData.password, // Ensure this is hashed before passing
          role: 'Admin',
          phone_number: adminData.phone_number,
        },
      });
      await tx.admin.create({
        data: {
          user_id: user.user_id,
        },
      });
      // Return user details
      return user;
    });
  }

  async addMultipleAdmins(adminsData) {
    return prisma.$transaction(async (tx) => {
      const admins = await Promise.all(
        adminsData.map(async (admin) => {
          // Check if email already exists
          const existingUser = await tx.user.findUnique({
            where: { email: admin.email },
          });
          if (existingUser) {
            throw new Error(`Email ${admin.email} already exists`);
          }

          const user = await tx.user.create({
            data: {
              name: admin.name,
              email: admin.email,
              password: admin.password, // Ensure this is hashed before passing
              role: 'Admin',
              phone_number: admin.phone_number,
            },
          });
          await tx.admin.create({
            data: {
              user_id: user.user_id,
            },
          });
          // Return user details
          return user;
        })
      );
      return admins;
    });
  }

  async deleteStudent(studentId) {
    return prisma.student.delete({
      where: { user_id: studentId },
    });
  }

  async deleteTeacher(teacherId) {
    return prisma.teacher.delete({
      where: { user_id: teacherId },
    });
  }

  async deleteAdmin(adminId) {
    return prisma.admin.delete({
      where: { user_id: adminId },
    });
  }

  async editStudent(studentId, studentData) {
    return prisma.$transaction(async (tx) => {
      let updatedUser = null;
      if (studentData.name || studentData.email || studentData.password || studentData.phone_number) {
        // Check if email is changing and if the new email exists
        if (studentData.email) {
          const existingUser = await tx.user.findUnique({
            where: { email: studentData.email },
          });
          if (existingUser && existingUser.user_id !== studentId) {
            throw new Error('Email already exists');
          }
        }
        updatedUser = await tx.user.update({
          where: { user_id: studentId },
          data: {
            name: studentData.name,
            email: studentData.email,
            password: studentData.password, // Ensure this is hashed before passing
            phone_number: studentData.phone_number,
          },
        });
      }
      const updatedStudent = await tx.student.update({
        where: { user_id: studentId },
        data: {
          matricule_number: studentData.matricule_number,
          nationality: studentData.nationality,
          level: studentData.level,
          institutional_email: studentData.institutional_email,
        },
      });
      // Return both updated user and student details
      return { ...updatedUser, ...updatedStudent };
    });
  }

  async editTeacher(teacherId, teacherData) {
    return prisma.$transaction(async (tx) => {
      let updatedUser = null;
      if (teacherData.name || teacherData.email || teacherData.password || teacherData.phone_number) {
        // Check if email is changing and if the new email exists
        if (teacherData.email) {
          const existingUser = await tx.user.findUnique({
            where: { email: teacherData.email },
          });
          if (existingUser && existingUser.user_id !== teacherId) {
            throw new Error('Email already exists');
          }
        }
        updatedUser = await tx.user.update({
          where: { user_id: teacherId },
          data: {
            name: teacherData.name,
            email: teacherData.email,
            password: teacherData.password, // Ensure this is hashed before passing
            phone_number: teacherData.phone_number,
          },
        });
      }
      const updatedTeacher = await tx.teacher.update({
        where: { user_id: teacherId },
        data: {},
      });
      // Return both updated user and teacher details
      return { ...updatedUser, ...updatedTeacher };
    });
  }

  async editAdmin(adminId, adminData) {
    return prisma.$transaction(async (tx) => {
      let updatedUser = null;
      if (adminData.name || adminData.email || adminData.password || adminData.phone_number) {
        // Check if email is changing and if the new email exists
        if (adminData.email) {
          const existingUser = await tx.user.findUnique({
            where: { email: adminData.email },
          });
          if (existingUser && existingUser.user_id !== adminId) {
            throw new Error('Email already exists');
          }
        }
        updatedUser = await tx.user.update({
          where: { user_id: adminId },
          data: {
            name: adminData.name,
            email: adminData.email,
            password: adminData.password, // Ensure this is hashed before passing
            phone_number: adminData.phone_number,
          },
        });
      }
      const updatedAdmin = await tx.admin.update({
        where: { user_id: adminId },
        data: {},
      });
      // Return both updated user and admin details
      return { ...updatedUser, ...updatedAdmin };
    });
  }

  async getAllAdmins(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.admin.findMany({
      skip,
      take: limit,
      include: { user: true },
    });
  }
}

export default new AdminService();