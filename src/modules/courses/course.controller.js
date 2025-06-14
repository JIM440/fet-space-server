import CourseService from './course.service.js';

class CourseController {
  async createCourse(req, res) {
    const course = await CourseService.createCourse(req.user.user_id, req.body);
    res.json(course);
  }

  async getCourseDetails(req, res) {
    const course = await CourseService.getCourseDetails(req.params.courseId);
    res.json(course);
  }

  async getStudentCourses(req, res) {
    const courses = await CourseService.getStudentCourses(req.user.user_id);
    res.json(courses);
  }

  async addTeacherToCourse(req, res) {
    const result = await CourseService.addTeacherToCourse(req.body.courseId, req.body.teacherId);
    res.json(result);
  }

  async addStudentToCourse(req, res) {
    const result = await CourseService.addStudentToCourse(req.body.courseId, req.body.studentId);
    res.json(result);
  }

  async removeStudentFromCourse(req, res) {
    const result = await CourseService.removeStudentFromCourse(req.body.courseId, req.body.studentId);
    res.json(result);
  }
}

export default new CourseController();