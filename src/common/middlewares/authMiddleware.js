import prisma from '../database/prismaClient.js';
import AuthService from '../../modules/auth/auth.service.js';

export function authMiddleware(roles) {
  return async (req, res, next) => {
    try {
      // 1. Validate JWT token
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) return res.status(401).json({ message: 'No token provided' });

      const { decoded, expired } = AuthService.verifyToken(token, process.env.JWT_SECRET || 'your-secret-key');
      if (expired) return res.status(401).json({ message: 'Token expired', expired: true });
      if (!decoded) return res.status(401).json({ message: 'Invalid token' });

      // 2. Verify user exists
      const user = await prisma.user.findUnique({ where: { user_id: decoded.userId } });
      if (!user) return res.status(403).json({ message: 'Forbidden: User not found' });

      // 3. Check if role is allowed
      const isSuperAdminOnly = roles.length === 1 && roles[0] === 'SuperAdmin';
      const isSuperAdminRequired = roles.includes('SuperAdmin');
      const isRoleAllowed = roles.includes(user.role);

      // 4. Verify role in associated table
      if (user.role === 'Admin') {
        const admin = await prisma.admin.findUnique({
          where: { user_id: decoded.userId },
          select: { is_super_admin: true },
        });

        if (!admin) {
          return res.status(403).json({ message: 'Forbidden: Admin not found' });
        }

        // If only SuperAdmin is allowed, reject if not super admin
        if (isSuperAdminOnly && !admin.is_super_admin) {
          return res.status(403).json({ message: 'Forbidden: Super admin access required' });
        }

        // If SuperAdmin is required among other roles, allow Admin (super or not) if role is in allowed list
        if (isSuperAdminRequired && !isRoleAllowed && !admin.is_super_admin) {
          return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }

        req.user = { ...user, is_super_admin: admin.is_super_admin };
      } else if (user.role === 'Student') {
        const student = await prisma.student.findUnique({
          where: { user_id: decoded.userId },
        });

        if (!student) {
          return res.status(403).json({ message: 'Forbidden: Student not found' });
        }

        // Reject if only SuperAdmin is allowed
        if (isSuperAdminOnly) {
          return res.status(403).json({ message: 'Forbidden: Super admin access required' });
        }

        if (!isRoleAllowed) {
          return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }

        req.user = user;
      } else if (user.role === 'Teacher') {
        const teacher = await prisma.teacher.findUnique({
          where: { user_id: decoded.userId },
        });

        if (!teacher) {
          return res.status(403).json({ message: 'Forbidden: Teacher not found' });
        }

        // Reject if only SuperAdmin is allowed
        if (isSuperAdminOnly) {
          return res.status(403).json({ message: 'Forbidden: Super admin access required' });
        }

        if (!isRoleAllowed) {
          return res.status(403).json({ message: 'Forbidden: Insufficient role' });
        }

        req.user = user;
      } else {
        return res.status(403).json({ message: 'Forbidden: Invalid role' });
      }

      next();
    } catch (error) {
      console.error('Authentication error:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
}