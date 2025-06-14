import prisma from '../../common/database/prismaClient.js';

class PollService {
  async createPoll(announcementId, data) {
    const pollType = data.type === 'general' ? 'general_announcement' : 'course_announcement';
    return prisma.poll.create({
      data: {
        ...data,
        [pollType + '_id']: parseInt(announcementId.replace(/^\D+/g, '')),
        type: data.type,
      },
    });
  }

  async respondToPoll(userId, pollId, optionId) {
    return prisma.poll_Response.create({
      data: {
        poll_id: pollId,
        poll_option_id: optionId,
        user_id: userId,
      },
    });
  }

  async getPollResponses(pollId) {
    return prisma.poll_Response.findMany({
      where: { poll_id: pollId },
      include: { user: true, option: true },
    });
  }
}

export default new PollService();