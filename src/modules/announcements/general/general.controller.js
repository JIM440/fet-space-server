import GeneralAnnouncementService from "./general.service.js";
import SocketService from "../../../common/utils/socket.service.js";
import prisma from "../../../common/database/prismaClient.js";

class GeneralAnnouncementController {
  async createAnnouncement(req, res) {
    console.log(req.body);
    const announcement = await GeneralAnnouncementService.createAnnouncement(req.user.user_id, req.body);

    const fullAnnouncement = await prisma.general_Announcement.findUnique({
      where: { announcement_id: announcement.announcement_id },
      include: {
        poll: true,
        attachments: true,
        admin: { include: { user: true } },
      },
    });
    SocketService.emitEvent(
      "generalAnnouncements",
      "newAnnouncement",
      fullAnnouncement
    );
    res.json(fullAnnouncement);
  }

  async getAnnouncements(req, res) {
    const { page = 1, limit = 10 } = req.query;
    const announcements = await GeneralAnnouncementService.getAnnouncements(
      page,
      limit
    );
    res.json(announcements);
  }

  async getAnnouncementDetails(req, res) {
    const announcement =
      await GeneralAnnouncementService.getAnnouncementDetails(
        req.params.announcementId
      );
    res.json(announcement);
  }

  async updateAnnouncement(req, res) {
    const announcement = await GeneralAnnouncementService.updateAnnouncement(
      req.params.announcementId,
      req.body
    );
    SocketService.emitEvent(
      "generalAnnouncements",
      "updateAnnouncement",
      announcement
    );
    res.json(announcement);
  }

  async deleteAnnouncement(req, res) {
    await GeneralAnnouncementService.deleteAnnouncement(
      req.params.announcementId
    );
    SocketService.emitEvent("generalAnnouncements", "deleteAnnouncement", {
      announcementId: req.params.announcementId,
    });
    res.json({ message: "Announcement deleted" });
  }
}

export default new GeneralAnnouncementController();