import { Router } from "express";
import CourseController from "./course.controller.js";
import { authMiddleware } from "../../common/middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/:courseId",
  authMiddleware(["Student", "Teacher"]),
  CourseController.getCourseDetails
);
router.get(
  "/student",
  authMiddleware(["Student"]),
  CourseController.getStudentCourses
);
router.get(
  "/:courseId/persons",
  authMiddleware(["Student", "Teacher"]),
  CourseController.getCoursePersons
);
router.get(
  "/:courseId/contents",
  authMiddleware(["Student", "Teacher"]),
  CourseController.getCourseContents
);
router.get(
  "/:courseId/assignments",
  authMiddleware(["Student", "Teacher"]),
  CourseController.getCourseAssignments
);
router.get(
  "/:courseId/revision-questions",
  authMiddleware(["Student", "Teacher"]),
  CourseController.getCourseRevisionQuestions
);
router.post(
  "/teachers",
  authMiddleware(["Teacher"]),
  CourseController.addTeacherToCourse
);
router.post(
  "/students",
  authMiddleware(["Teacher"]),
  CourseController.addStudentToCourse
);
router.delete(
  "/students",
  authMiddleware(["Teacher"]),
  CourseController.removeStudentFromCourse
);
router.get(
  "/:courseId/revision-questions",
  authMiddleware(["Student", "Teacher"]),
  CourseController.getCourseRevisionQuestions
);
router.get(
  "/:courseId/contents",
  authMiddleware(["Student", "Teacher"]),
  CourseController.getCourseContents
);

export default router;
