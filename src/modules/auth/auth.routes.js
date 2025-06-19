import { Router } from 'express';
import AuthController from './auth.controller.js';
import { authMiddleware } from '../../common/middlewares/authMiddleware.js';

const router = Router();

router.post('/login', AuthController.login);
router.post('/logout', authMiddleware(["Student"]), AuthController.logout);
router.post('/refresh', AuthController.refreshToken);

export default router;