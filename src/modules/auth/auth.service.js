import prisma from '../../common/database/prismaClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

class AuthService {
  generateTokens(userId, role, is_super_admin = false) {
    const accessToken = jwt.sign(
      { userId, role, ...(role === 'Admin' ? { is_super_admin } : {}) },
      process.env.JWT_SECRET || 'your-secret-key',
      { expiresIn: '15m' }
    );
    const refreshToken = jwt.sign(
      { userId, role, ...(role === 'Admin' ? { is_super_admin } : {}) },
      process.env.REFRESH_SECRET || 'your-refresh-secret-key',
      { expiresIn: '7d' }
    );
    return { accessToken, refreshToken };
  }

  verifyToken(token, secret) {
    try {
      return { decoded: jwt.verify(token, secret), expired: false };
    } catch (error) {
      if (error.name === 'TokenExpiredError') {
        return { decoded: error.expiredAt, expired: true };
      }
      return { decoded: null, expired: true };
    }
  }

  async hashPassword(password) {
    return bcrypt.hash(password, 10);
  }

  async comparePassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  async saveRefreshToken(userId, refreshToken) {
    await prisma.user.update({
      where: { user_id: userId },
      data: { refreshToken },
    });
  }

  async deleteRefreshToken(userId) {
    await prisma.user.update({
      where: { user_id: userId },
      data: { refreshToken: null },
    });
  }

  async getUserByRole(identifier, password, role) {
    const lookupRole = role.toLowerCase() === 'superadmin' ? 'Admin' : role;

    let userQuery;
    switch (lookupRole.toLowerCase()) {
      case 'student':
        userQuery = prisma.student.findUnique({
          where: { matricule_number: identifier.toLowerCase() },
          include: { user: true },
        });
        break;
      case 'teacher':
      case 'admin':
        userQuery = prisma.user.findUnique({
          where: { email: identifier },
          include: { teacher: true, admin: true },
        });
        break;
      default:
        return null;
    }

    const result = await userQuery;
    if (!result || !(await this.comparePassword(password, result.user?.password || result.password))) {
      return null;
    }

    const user = result.user || result;
    if (lookupRole === 'Admin' && role.toLowerCase() === 'superadmin') {
      if (!result.admin?.is_super_admin) {
        return null;
      }
    }

    return user;
  }

  async changePassword(userId, currentPassword, newPassword) {
    const user = await prisma.user.findUnique({
      where: { user_id: userId },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Optional: Verify current password for security
    const isCurrentPasswordValid = await this.comparePassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new Error('Current password is incorrect');
    }

    const hashedPassword = await this.hashPassword(newPassword);
    await prisma.user.update({
      where: { user_id: userId },
      data: { password: hashedPassword },
    });

    return { success: true, message: 'Password updated successfully' };
  }
}

export default new AuthService();