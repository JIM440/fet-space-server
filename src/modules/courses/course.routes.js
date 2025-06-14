import { Router } from 'express';
import CourseController from './course.controller.js';
import { authMiddleware } from '../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/', authMiddleware(['Teacher']), CourseController.createCourse);
router.get('/:courseId', authMiddleware(['Student', 'Teacher']), CourseController.getCourseDetails);
router.get('/student', authMiddleware(['Student']), CourseController.getStudentCourses);
router.post('/teachers', authMiddleware(['Teacher']), CourseController.addTeacherToCourse);
router.post('/students', authMiddleware(['Teacher']), CourseController.addStudentToCourse);
router.delete('/students', authMiddleware(['Teacher']), CourseController.removeStudentFromCourse);

export default router;