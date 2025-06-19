import { Router } from 'express';
import AdminController from './admin.controller.js';
import { authMiddleware } from '../../../common/middlewares/authMiddleware.js';

const router = Router();

// Admin-accessible routes
router.get('/teachers', authMiddleware(['Admin', 'SuperAdmin']), AdminController.getAllTeachers);
router.get('/teachers/search', authMiddleware(['Admin', 'SuperAdmin']), AdminController.searchTeacher);
router.post('/teachers', authMiddleware(['Admin', 'SuperAdmin']), AdminController.addTeacher);
router.post('/teachers/bulk', authMiddleware(['Admin', 'SuperAdmin']), AdminController.addMultipleTeachers);
router.delete('/teachers/:teacherId', authMiddleware(['Admin', 'SuperAdmin']), AdminController.deleteTeacher);
router.put('/teachers/:teacherId', authMiddleware(['Admin', 'SuperAdmin']), AdminController.editTeacher);

router.get('/students', authMiddleware(['Admin', 'SuperAdmin']), AdminController.getAllStudents);
router.get('/students/search', authMiddleware(['Admin', 'SuperAdmin']), AdminController.searchStudents);
// router.post('/students', AdminController.addStudent);
router.post('/students', authMiddleware(['Admin', 'SuperAdmin']), AdminController.addStudent);
router.post('/students/bulk', AdminController.addMultipleStudents);
// router.post('/students/bulk', authMiddleware(['Admin', 'SuperAdmin']), AdminController.addMultipleStudents);
// router.delete('/students/:studentId', AdminController.deleteStudent);
router.delete('/students/:studentId', authMiddleware(['Admin', 'SuperAdmin']), AdminController.deleteStudent);
router.put('/students/:studentId', authMiddleware(['Admin', 'SuperAdmin']), AdminController.editStudent);

// SuperAdmin-only routes
router.get('/admins', authMiddleware(['SuperAdmin, Admin']), AdminController.getAllAdmins);
router.post('/admins', authMiddleware(['SuperAdmin']), AdminController.addAdmin);
router.delete('/admins/:adminId', authMiddleware(['SuperAdmin']), AdminController.deleteAdmin);
router.put('/admins/:adminId', authMiddleware(['SuperAdmin']), AdminController.editAdmin);

export default router;