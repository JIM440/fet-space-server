import AdminService from './admin.service.js';

class AdminController {
  async getAllStudents(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const students = await AdminService.getAllStudents(page, limit);
    res.json(students);
  }

  async searchStudents(req, res) {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query parameter is required' });
    const students = await AdminService.searchStudents(query);
    res.json(students);
  }

  async getAllTeachers(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const teachers = await AdminService.getAllTeachers(page, limit);
    res.json(teachers);
  }

  async searchTeacher(req, res) {
    const { query } = req.query;
    if (!query) return res.status(400).json({ message: 'Query parameter is required' });
    const teachers = await AdminService.searchTeacher(query);
    res.json(teachers);
  }

  async addStudent(req, res) {
    const studentData = req.body;
    const student = await AdminService.addStudent(studentData);
    res.json(student);
  }

  async addMultipleStudents(req, res) {
    const studentsData = req.body;
    if (!Array.isArray(studentsData) || studentsData.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of student objects' });
    }
    const result = await AdminService.addMultipleStudents(studentsData);
    res.json({ count: result.count, message: 'Students created successfully' });
  }

  async addTeacher(req, res) {
    const teacher = await AdminService.addTeacher(teacherData);
    res.json(teacher);
  }

  async addMultipleTeachers(req, res) {
    const teachersData = req.body;
    if (!Array.isArray(teachersData) || teachersData.length === 0) {
      return res.status(400).json({ message: 'Request body must be a non-empty array of teacher objects' });
    }
    const result = await AdminService.addMultipleTeachers(teachersData);
    res.json({ count: result.count, message: 'Teachers created successfully' });
  }

  async deleteStudent(req, res) {
    const { studentId } = req.params;
    await AdminService.deleteStudent(parseInt(studentId));
    res.json({ message: 'Student deleted successfully' });
  }

  async deleteTeacher(req, res) {
    const { teacherId } = req.params;
    await AdminService.deleteTeacher(parseInt(teacherId));
    res.json({ message: 'Teacher deleted successfully' });
  }

  async editStudent(req, res) {
    const { studentId } = req.params;
    const studentData = req.body;
    const student = await AdminService.editStudent(parseInt(studentId), studentData);
    res.json(student);
  }

  async editTeacher(req, res) {
    const { teacherId } = req.params;
    const teacherData = req.body;
    const teacher = await AdminService.editTeacher(parseInt(teacherId), teacherData);
    res.json(teacher);
  }

  async getAllAdmins(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const admins = await AdminService.getAllAdmins(page, limit);
    res.json(admins);
  }

  async addAdmin(req, res) {
    const adminData = req.body;
    const admin = await AdminService.addAdmin(adminData);
    res.json(admin);
  }

  async deleteAdmin(req, res) {
    const { adminId } = req.params;
    await AdminService.deleteAdmin(parseInt(adminId));
    res.json({ message: 'Admin deleted successfully' });
  }

  async editAdmin(req, res) {
    const { adminId } = req.params;
    const adminData = req.body;
    const admin = await AdminService.editAdmin(parseInt(adminId), adminData);
    res.json(admin);
  }
}

export default new AdminController();