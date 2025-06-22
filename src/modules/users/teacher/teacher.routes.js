import { Router } from 'express';
import TeacherController from './teacher.controller.js';
import { authMiddleware } from '../../../common/middlewares/authMiddleware.js';

const router = Router();

router.get('/create/:courseId/search/students', TeacherController.searchStudent);
router.get('/create/:courseId/search/teachers', TeacherController.searchTeacher);
router.post('/create/:courseId/add/student', TeacherController.addStudentToCourse); // Updated route
router.post('/create/:courseId/add/teacher', TeacherController.addTeacherToCourse); // New route
router.delete('/courses/students', authMiddleware(['Teacher']), TeacherController.removeStudentFromCourse);
router.get('/courses/mine', authMiddleware(['Teacher']), TeacherController.getMyCourses);
router.get('/courses/:courseId', authMiddleware(['Teacher']), TeacherController.getCourseDetails);
router.post('/courses/:courseId/content', authMiddleware(['Teacher']), TeacherController.addCourseContent);
router.post('/courses/:courseId/revision-questions', authMiddleware(['Teacher']), TeacherController.addRevisionQuestions);

export default router;