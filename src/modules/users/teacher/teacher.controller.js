import TeacherService from './teacher.service.js';

class TeacherController {
  async addCourse(req, res) {
    const course = await TeacherService.addCourse(req.user.user_id, req.body);
    res.json(course);
  }

  async addStudentToCourse(req, res) {
    const result = await TeacherService.addStudentToCourse(req.body.courseId, req.body.studentId);
    res.json(result);
  }

  async removeStudentFromCourse(req, res) {
    const result = await TeacherService.removeStudentFromCourse(req.body.courseId, req.body.studentId);
    res.json(result);
  }

  async searchStudent(req, res) {
    const students = await TeacherService.searchStudent(req.query.q);
    res.json(students);
  }

  async searchTeacher(req, res) {
    const teachers = await TeacherService.searchTeacher(req.query.q);
    res.json(teachers);
  }

  async getMyCourses(req, res) {
    const courses = await TeacherService.getMyCourses(req.user.user_id);
    res.json(courses);
  }
}

export default new TeacherController();