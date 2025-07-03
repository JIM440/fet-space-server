import prisma from "../../../common/database/prismaClient.js";
import bcrypt from "bcryptjs";

class AdminService {
  #hashPassword(password) {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  async getAllStudents(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.student.findMany({
      skip,
      take: parseInt(limit),
      include: { user: true },
    });
  }

  async searchStudents(query) {
    const lowerCaseQuery = query.toLowerCase();
    return prisma.student.findMany({
      where: {
        OR: [
          { user: { name: { contains: lowerCaseQuery } } },
          { matricule_number: { contains: lowerCaseQuery } },
        ],
      },
      include: { user: true },
    });
  }

  async searchTeacher(query) {
    const lowerCaseQuery = query.toLowerCase();
    return prisma.teacher.findMany({
      where: { user: { name: { contains: lowerCaseQuery } } },
      include: { user: true },
    });
  }

  async getAllTeachers(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.teacher.findMany({
      skip,
      take: parseInt(limit),
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
        throw new Error("Email already exists");
      }

      // Hash the provided password
      const hashedPassword = await this.#hashPassword(studentData.matricule_number);

      const user = await tx.user.create({
        data: {
          name: studentData.name,
          email: studentData.email,
          password: hashedPassword,
          role: "Student",
          phone_number: studentData.phone_number,
        },
      });
      const student = await tx.student.create({
        data: {
          user_id: user.user_id,
          matricule_number: studentData.matricule_number.toLowerCase(),
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

          // Check if matricule_number is provided
          if (!student.matricule_number) {
            throw new Error(`Matricule number is required for ${student.email}`);
          }

          // Use matricule_number as default password
          const hashedPassword = await this.#hashPassword(student.matricule_number);

          const user = await tx.user.create({
            data: {
              name: student.name,
              email: student.email,
              password: hashedPassword,
              role: "Student",
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
        throw new Error("Email already exists");
      }

      // Hash the provided password
      const hashedPassword = await this.#hashPassword("Teacher@2025");

      const user = await tx.user.create({
        data: {
          name: teacherData.name,
          email: teacherData.email,
          password: hashedPassword,
          role: "Teacher",
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

          // Use default teacher password
      const hashedPassword = await this.#hashPassword("Teacher@2025");

          const user = await tx.user.create({
            data: {
              name: teacher.name,
              email: teacher.email,
              password: hashedPassword,
              role: "Teacher",
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
        throw new Error("Email already exists");
      }

      // Hash the provided password
      const hashedPassword = await this.#hashPassword("Admin@2025");

      const user = await tx.user.create({
        data: {
          name: adminData.name,
          email: adminData.email,
          password: hashedPassword,
          role: "Admin",
          phone_number: adminData.phone_number,
        },
      });
      const admin = await tx.admin.create({
        data: {
          user_id: user.user_id,
          is_super_admin: !!adminData.is_super_admin,
        },
      });
      // Return user details
      return {...user, ...admin};
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

          // Use default admin password
      const hashedPassword = await this.#hashPassword("Admin@2025");

          const user = await tx.user.create({
            data: {
              name: admin.name,
              email: admin.email,
              password: hashedPassword,
              role: "Admin",
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
    return prisma.$transaction(async (tx) => {
      await tx.student.delete({
        where: { user_id: studentId },
      });
      // Cascade should handle User deletion, but ensure it's deleted
      await tx.user.delete({
        where: { user_id: studentId },
      });
      return { message: "Student and associated user deleted successfully" };
    });
  }

  async deleteTeacher(teacherId) {
    return prisma.$transaction(async (tx) => {
      await tx.teacher.delete({
        where: { user_id: teacherId },
      });
      // Cascade should handle User deletion, but ensure it's deleted
      await tx.user.delete({
        where: { user_id: teacherId },
      });
      return { message: "Teacher and associated user deleted successfully" };
    });
  }

  async deleteAdmin(adminId) {
    return prisma.$transaction(async (tx) => {
      await tx.admin.delete({
        where: { user_id: adminId },
      });
      // Cascade should handle User deletion, but ensure it's deleted
      await tx.user.delete({
        where: { user_id: adminId },
      });
      return { message: "Admin and associated user deleted successfully" };
    });
  }

  async editStudent(studentId, studentData) {
    if (!studentId || isNaN(parseInt(studentId))) {
      throw new Error("Invalid student ID");
    }
    return prisma.$transaction(async (tx) => {
      let updatedUser = null;
      if (
        studentData.name ||
        studentData.email ||
        studentData.password ||
        studentData.phone_number
      ) {
        if (studentData.email) {
          const existingUser = await tx.user.findFirst({
            where: {
              email: studentData.email,
              user_id: { not: Number(studentId) },
            },
          });
          if (existingUser) {
            throw new Error("Email already exists");
          }
        }
        let hashedPassword = undefined;
        if (studentData.password) {
          hashedPassword = await this.#hashPassword(studentData.password);
        }
        updatedUser = await tx.user.update({
          where: { user_id: Number(studentId) },
          data: {
            name: studentData.name,
            email: studentData.email,
            password: hashedPassword,
            phone_number: studentData.phone_number,
          },
        });
      }
      const updatedStudent = await tx.student.update({
        where: { user_id: Number(studentId) },
        data: {
          matricule_number: studentData.matricule_number,
          nationality: studentData.nationality,
          level: studentData.level,
          institutional_email: studentData.institutional_email,
        },
      });
      return { ...updatedStudent, ...updatedUser };
    });
  }

  async editTeacher(teacherId, teacherData) {
    if (!teacherId || isNaN(teacherId)) {
      throw new Error("Invalid teacher ID");
    }
    return prisma.$transaction(async (tx) => {
      let updatedUser = null;
      if (
        teacherData.name ||
        teacherData.email ||
        teacherData.password ||
        teacherData.phone_number
      ) {
        if (teacherData.email) {
          const existingUser = await tx.user.findFirst({
            where: {
              email: teacherData.email,
              user_id: { not: Number(teacherId) },
            },
          });
          if (existingUser) {
            throw new Error("Email already exists");
          }
        }
        let hashedPassword = undefined;
        if (teacherData.password) {
          hashedPassword = await this.#hashPassword(teacherData.password);
        }
        updatedUser = await tx.user.update({
          where: { user_id: Number(teacherId) },
          data: {
            name: teacherData.name,
            email: teacherData.email,
            password: hashedPassword,
            phone_number: teacherData.phone_number,
          },
        });
      }
      const updatedTeacher = await tx.teacher.update({
        where: { user_id: Number(teacherId) },
        data: {},
      });
      return { ...updatedTeacher, ...updatedUser };
    });
  }

  async editAdmin(adminId, adminData) {
    if (!adminId || isNaN(adminId)) {
      throw new Error("Invalid admin ID");
    }
    return prisma.$transaction(async (tx) => {
      let updatedUser = null;
      if (
        adminData.name ||
        adminData.email ||
        adminData.password ||
        adminData.phone_number ||
        adminData.role
      ) {
        if (adminData.email) {
          const existingUser = await tx.user.findFirst({
            where: {
              email: adminData.email,
              user_id: { not: Number(adminId) },
            },
          });
          if (existingUser) {
            throw new Error("Email already exists");
          }
        }
        let hashedPassword = undefined;
        if (adminData.password) {
          hashedPassword = await this.#hashPassword(adminData.password);
        }
        updatedUser = await tx.user.update({
          where: { user_id: Number(adminId) },
          data: {
            name: adminData.name,
            email: adminData.email,
            password: hashedPassword,
            phone_number: adminData.phone_number,
            role: adminData.role,
          },
        });
      }
      const updatedAdmin = await tx.admin.update({
        where: { user_id: Number(adminId) },
        data: {},
      });
      return { ...updatedAdmin, ...updatedUser };
    });
  }

  async getAllAdmins(page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.admin.findMany({
      skip,
      take: parseInt(limit),
      include: { user: true },
    });
  }
}

export default new AdminService();