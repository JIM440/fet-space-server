import StudentService from "./student.service.js";

class StudentController {
  async getUserDetails(req, res) {
    const user = await StudentService.getUserDetails(req.user.user_id);
    res.json(user);
  }

  async updateUserDetails(req, res) {
    const user = await StudentService.updateUserDetails(
      req.user.user_id,
      req.body
    );
    res.json(user);
  }

  async getNotifications(req, res) {
    const notifications = await StudentService.getNotifications(
      req.user.user_id
    );
    res.json(notifications);
  }

  async getUpcomingDeadlines(req, res) {
    const deadlines = await StudentService.getUpcomingDeadlines(
      req.user.user_id
    );
    res.json(deadlines);
  }

  async getEnrolledCourses(req, res) {
    const courses = await StudentService.getEnrolledCourses(req.user.user_id);
    res.json(courses);
  }

  async getCourseDetails(req, res) {
    const course = await StudentService.getCourseDetails(req.params.courseId);
    res.json(course);
  }

  async joinCourse(req, res) {
    try {
      const { join_code } = req.body;
      const course = await StudentService.joinCourse(req.user.user_id, { join_code });
      res.json(course);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async submitAssignment(req, res) {
    try {
      const { assignmentId, attachments } = req.body;
      const result = await StudentService.submitAssignment(req.user.user_id, parseInt(assignmentId), { attachments });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAssignmentDetailsForStudent(req, res) {
    const assignment = await StudentService.getAssignmentDetailsForStudent(req.params.assignmentId, req.user.user_id);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  }

  async getUpcomingDeadlines(req, res) {
    try {
      const deadlines = await StudentService.getUpcomingDeadlinesForStudent(req.user.user_id);
      res.json(deadlines);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new StudentController();
