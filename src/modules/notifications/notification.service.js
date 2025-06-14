import prisma from '../../common/database/prismaClient.js';

class NotificationService {
  async getNotifications(userId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    return prisma.notification.findMany({
      where: { user_id: userId },
      skip,
      take: limit,
    });
  }
}

export default new NotificationService();