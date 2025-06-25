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

router.post(
  "/assignments/:assignmentId/submit",
  authMiddleware(["Student"]),
  StudentController.submitAssignment
);

router.get(
  "/assignments/:assignmentId/details",
  authMiddleware(["Student"]),
  StudentController.getAssignmentDetailsForStudent
);

router.get(
  "/deadlines/upcoming",
  authMiddleware(["Student"]),
  StudentController.getUpcomingDeadlines
);

export default router;
