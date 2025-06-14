import { Router } from 'express';
import TeacherController from './teacher.controller.js';
import { authMiddleware } from '../../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/courses', authMiddleware(['Teacher']), TeacherController.addCourse);
router.post('/courses/students', authMiddleware(['Teacher']), TeacherController.addStudentToCourse);
router.delete('/courses/students', authMiddleware(['Teacher']), TeacherController.removeStudentFromCourse);
router.get('/search/students', authMiddleware(['Teacher']), TeacherController.searchStudent);
router.get('/search/teachers', authMiddleware(['Teacher']), TeacherController.searchTeacher);
router.get('/courses/mine', authMiddleware(['Teacher']), TeacherController.getMyCourses);

export default router;