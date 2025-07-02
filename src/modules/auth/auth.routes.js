import { Router } from 'express';
import AuthController from './auth.controller.js';
import { authMiddleware } from '../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/logout', authMiddleware(["Student", "Teacher", "Admin"]), AuthController.logout);
router.post('/refresh', AuthController.refreshToken);
router.post('/change-password', authMiddleware(["Student", "Teacher", "Admin"]), AuthController.changePassword);

export default router;