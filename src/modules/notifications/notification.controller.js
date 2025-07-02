import NotificationService from './notification.service.js';

class NotificationController {
  async getNotifications(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const notifications = await NotificationService.getNotifications(req.user.user_id, parseInt(page), parseInt(limit));
    res.json(notifications);
  }

  async markNotificationAsRead(req, res) {
    try {
      const result = await NotificationService.markNotificationAsRead(req.params.notificationId, req.user.user_id);
      res.json(result);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  }
}

export default new NotificationController();