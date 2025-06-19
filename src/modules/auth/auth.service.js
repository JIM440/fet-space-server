import prisma from '../../common/database/prismaClient.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

class AuthService {
  generateTokens(userId, role) {
    const accessToken = jwt.sign({ userId, role }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '15m' });
    const refreshToken = jwt.sign({ userId, role }, process.env.REFRESH_SECRET || 'your-refresh-secret-key', { expiresIn: '7d' });
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
    let userQuery;
    switch (role.toLowerCase()) {
      case 'student':
        userQuery = prisma.student.findUnique({
          where: { matricule_number: identifier.toLowerCase() },
          include: { user: true },
        });
        break;
      case 'teacher':
      case 'admin':
      case 'superadmin':
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
    return result.user || result;
  }
}

export default new AuthService();