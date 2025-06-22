import TeacherService from './teacher.service.js';

class TeacherController {
  async addCourse(req, res) {
    const course = await TeacherService.addCourse(req.user.user_id, req.body);
    res.json(course);
  }

  async addStudentToCourse(req, res) {
    try {
      const result = await TeacherService.addStudentToCourse(parseInt(req.params.courseId), req.body.studentId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addTeacherToCourse(req, res) {
    try {
      const result = await TeacherService.addTeacherToCourse(parseInt(req.params.courseId), req.body.teacherId);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async removeStudentFromCourse(req, res) {
    const result = await TeacherService.removeStudentFromCourse(req.body.courseId, req.body.studentId);
    res.json(result);
  }

  async searchStudent(req, res) {
    console.log('Search Student Query:', req.query.q, 'Course ID:', req.params.courseId); // Debug log
    const students = await TeacherService.searchStudent(req.query.q, parseInt(req.params.courseId));
    res.json(students);
  }

  async searchTeacher(req, res) {
    console.log('Search Teacher Query:', req.query.q, 'Course ID:', req.params.courseId); // Debug log
    const teachers = await TeacherService.searchTeacher(req.query.q, parseInt(req.params.courseId));
    res.json(teachers);
  }

  async getMyCourses(req, res) {
    const courses = await TeacherService.getMyCourses(parseInt(req.user.user_id));
    res.json(courses);
  }

  async getCourseDetails(req, res) {
    const courseId = parseInt(req.params.courseId);
    const course = await TeacherService.getCourseDetails(courseId);
    res.json(course);
  }

 async addCourseContent(req, res) {
    try {
      const { url, file_type } = req.body;
      const result = await TeacherService.addCourseContent(req.user.user_id, req.params.courseId, { url, file_type });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async addRevisionQuestions(req, res) {
    try {
      const { url, file_type } = req.body;
      const result = await TeacherService.addRevisionQuestions(req.user.user_id, req.params.courseId, { url, file_type });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new TeacherController();