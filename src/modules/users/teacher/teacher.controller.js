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
    const students = await TeacherService.searchStudent(req.query.q, parseInt(req.params.courseId));
    res.json(students);
  }

  async searchTeacher(req, res) {
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

  async deleteCourseContent(req, res) {
    try {
      const result = await TeacherService.deleteCourseContent(req.user.user_id, parseInt(req.params.contentId));
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async deleteRevisionQuestions(req, res) {
    try {
      const result = await TeacherService.deleteRevisionQuestions(req.user.user_id, parseInt(req.params.questionId));
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async createAssignment(req, res) {
    try {
      const { courseId, title, description, due_date, attachments } = req.body;
      const result = await TeacherService.createAssignment(req.user.user_id, parseInt(courseId), { title, description, due_date, attachments });
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async updateAssignment(req, res) {
    try {
      const { assignmentId, title, description, due_date, attachments } = req.body;
      console.log(attachments)
      const result = await TeacherService.updateAssignment(req.user.user_id, parseInt(assignmentId), {
  title,
  description,
  due_date: new Date(due_date),
  attachments
}
);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

async deleteAssignment(req, res) {
    try {
      const result = await TeacherService.deleteAssignment(parseInt(req.user.user_id), parseInt(req.params.assignmentId));
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }

  async getAssignmentDetailsForTeacher(req, res) {
    const assignment = await TeacherService.getAssignmentDetailsForTeacher(req.params.assignmentId);
    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }
    res.json(assignment);
  }

  async getUpcomingDeadlines(req, res) {
    try {
      const deadlines = await TeacherService.getUpcomingDeadlinesForTeacher(req.user.user_id);
      console.log('deadlines:', deadlines)
      res.json(deadlines);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new TeacherController();