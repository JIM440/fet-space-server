import prisma from '../../common/database/prismaClient.js';

class PollService {
  async createPoll(announcementId, data) {
    const pollType = data.type === 'general' ? 'general_announcement_id' : 'course_announcement_id';
    return prisma.poll.create({
      data: {
        [pollType]: parseInt(announcementId),
        allow_multiple_answers: data.allow_multiple_answers,
        type: data.type,
      },
    });
  }

  async toggleVote(userId, pollId, optionId) {
    const existingVote = await prisma.poll_Response.findFirst({
      where: { poll_id: parseInt(pollId), user_id: userId, poll_option_id: optionId },
    });

    if (existingVote) {
      // Unvote: Delete the existing vote
      await prisma.poll_Response.delete({
        where: { response_id: existingVote.response_id },
      });
      return { action: 'unvoted', pollId, optionId };
    } else {
      // Vote: Create a new vote
      await prisma.poll_Response.create({
        data: { poll_id: parse(pollId), poll_option_id: optionId, user_id: userId },
      });
      return { action: 'voted', pollId, optionId };
    }
  }

  async getPollResponses(pollId) {
    return prisma.poll_Response.findMany({
      where: { poll_id: parseInt(pollId) },
      include: { user: true, option: { select: { content: true } } },
    });
  }
}

export default new PollService();