import CommentService from "./comment.service.js";

class CommentController {
  async createComment(req, res) {
    const { type, targetId, content } = req.body; 
    const comment = await CommentService.createComment(
      req.user.user_id,
      type,
      parseInt(targetId),
      content
    );
    res.json(comment);
  }

  async getComments(req, res) {
    const { type, targetId, page = 1, limit = 10 } = req.query;
    const comments = await CommentService.getComments(
      type,
      targetId,
      page,
      limit
    );
    const totalComments = comments.length === 0 ? null : comments;
    res.json(totalComments);
  }

  async updateComment(req, res) {
    const comment = await CommentService.updateComment(
      req.params.commentId,
      req.body.content
    );
    res.json(comment);
  }

  async deleteComment(req, res) {
    await CommentService.deleteComment(req.params.commentId);
    res.json({ message: "Comment deleted" });
  }
}

export default new CommentController();
