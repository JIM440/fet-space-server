import prisma from '../database/prismaClient.js';
import AuthService from '../../modules/auth/auth.service.js';

export function authMiddleware(roles) {
  return async (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    const { decoded, expired } = AuthService.verifyToken(token, process.env.JWT_SECRET || 'your-secret-key');
    if (expired) return res.status(401).json({ message: 'Token expired', expired: true });
    if (!decoded) return res.status(401).json({ message: 'Invalid token' });

    const user = await prisma.user.findUnique({ where: { user_id: decoded.userId } });
    if (!user || !roles.includes(user.role)) return res.status(403).json({ message: 'Forbidden' });

    req.user = user;
    next();
  };
}