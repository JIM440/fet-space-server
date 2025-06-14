import prisma from '../../common/database/prismaClient.js';

class HealthController {
  async checkHealth(req, res) {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({ status: 'healthy', message: 'Server and database are running' });
    } catch (error) {
      res.status(503).json({ status: 'unhealthy', message: 'Server or database error', error: error.message });
    }
  }
}

export default new HealthController();