import { Router } from "express";
import StudentController from "./student.controller.js";
import { authMiddleware } from "../../../common/middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/details",
  authMiddleware(["Student"]),
  StudentController.getUserDetails
);
router.put(
  "/details",
  authMiddleware(["Student"]),
  StudentController.updateUserDetails
);
router.get(
  "/notifications",
  authMiddleware(["Student"]),
  StudentController.getNotifications
);
router.get(
  "/deadlines",
  authMiddleware(["Student"]),
  StudentController.getUpcomingDeadlines
);
router.get(
  "/courses",
  authMiddleware(["Student"]),
  StudentController.getEnrolledCourses
);

router.post(
  "/courses/join",
  authMiddleware(["Student"]),
  StudentController.joinCourse
);

export default router;
