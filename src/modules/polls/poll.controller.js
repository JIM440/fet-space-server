import PollService from './poll.service.js';
import SocketService from '../../common/utils/socket.service.js';

class PollController {
  async createPoll(req, res) {
    const { announcementId, type } = req.body;
    if (!type || !['general', 'course'].includes(type)) {
      return res.status(400).json({ message: 'Type must be "general" or "course"' });
    }
    const poll = await PollService.createPoll(announcementId, req.body);
    SocketService.emitEvent(`announcement_${announcementId}`, 'newPoll', poll);
    res.json(poll);
  }

  async toggleVote(req, res) {
    const { pollId, optionId } = req.body;
    const response = await PollService.toggleVote(req.user.user_id, parseInt(pollId), optionId);
    SocketService.emitEvent(`announcement_${pollId}`, 'pollResponse', response);
    res.json(response);
  }

  async getPollResponses(req, res) {
    const responses = await PollService.getPollResponses(req.params.pollId);
    res.json(responses);
  }
}

export default new PollController();