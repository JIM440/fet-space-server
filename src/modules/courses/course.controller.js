import CourseService from './course.service.js';

class CourseController {
  async getCourseDetails(req, res) {
    const course = await CourseService.getCourseDetails(req.params.courseId);
    res.json(course);
  }

  async getStudentCourses(req, res) {
    const courses = await CourseService.getStudentCourses(req.user.user_id);
    res.json(courses);
  }

  async getCoursePersons(req, res) {
    const persons = await CourseService.getCoursePersons(req.params.courseId);
    res.json(persons);
  }

  async getCourseContents(req, res) {
    const contents = await CourseService.getCourseContents(req.params.courseId);
    res.json(contents);
  }

  async getCourseAssignments(req, res) {
    const assignments = await CourseService.getCourseAssignments(req.params.courseId);
    res.json(assignments);
  }

  async getCourseRevisionQuestions(req, res) {
    const revisionQuestions = await CourseService.getCourseRevisionQuestions(req.params.courseId);
    res.json(revisionQuestions);
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

  async getCourseContents(req, res) {
    const contents = await CourseService.getCourseContents(req.params.courseId);
    res.json(contents);
  }

  async getCourseRevisionQuestions(req, res) {
    const revisionQuestions = await CourseService.getCourseRevisionQuestions(req.params.courseId);
    res.json(revisionQuestions);
  }
}

export default new CourseController();