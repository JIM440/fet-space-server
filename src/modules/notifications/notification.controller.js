import NotificationService from './notification.service.js';

class NotificationController {
  async getNotifications(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const notifications = await NotificationService.getNotifications(req.user.user_id, page, limit);
    res.json(notifications);
  }
}

export default new NotificationController();