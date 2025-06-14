import prisma from '../../common/database/prismaClient.js';

class CommentService {
  async createComment(userId, type, targetId, content) {
    let data = { user_id: userId, content };
    switch (type.toLowerCase()) {
      case 'assignment':
        data.assignment_id = targetId;
        break;
      case 'generalannouncement':
        data.general_announcement_id = targetId;
        break;
      case 'courseannouncement':
        data.course_announcement_id = targetId;
        break;
      default:
        throw new Error('Invalid comment type');
    }
    return prisma.comment.create({ data });
  }

  async getComments(type, targetId, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    let where = {};
    switch (type.toLowerCase()) {
      case 'assignment':
        where.assignment_id = targetId;
        break;
      case 'generalannouncement':
        where.general_announcement_id = targetId;
        break;
      case 'courseannouncement':
        where.course_announcement_id = targetId;
        break;
      default:
        throw new Error('Invalid comment type');
    }
    return prisma.comment.findMany({
      where,
      include: { user: true },
      skip,
      take: limit,
    });
  }

  async updateComment(commentId, content) {
    return prisma.comment.update({ where: { comment_id: commentId }, data: { content } });
  }

  async deleteComment(commentId) {
    return prisma.comment.delete({ where: { comment_id: commentId } });
  }
}

export default new CommentService();