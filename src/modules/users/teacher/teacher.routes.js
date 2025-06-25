import { Router } from "express";
import TeacherController from "./teacher.controller.js";
import { authMiddleware } from "../../../common/middlewares/authMiddleware.js";

const router = Router();

router.get(
  "/create/:courseId/search/students",
    authMiddleware(["Teacher"]),
  TeacherController.searchStudent
);
router.get(
  "/create/:courseId/search/teachers",
    authMiddleware(["Teacher"]),
  TeacherController.searchTeacher
);
router.post(
  "/courses/create/",
    authMiddleware(["Teacher"]),
  TeacherController.addCourse
);
router.post(
  "/create/:courseId/add/student",
    authMiddleware(["Teacher"]),
  TeacherController.addStudentToCourse
);
router.post(
  "/create/:courseId/add/teacher",
    authMiddleware(["Teacher"]),
  TeacherController.addTeacherToCourse
);
router.delete(
  "/courses/students",
  authMiddleware(["Teacher"]),
  TeacherController.removeStudentFromCourse
);
router.get(
  "/courses/mine",
  authMiddleware(["Teacher"]),
  TeacherController.getMyCourses
);
router.get(
  "/courses/:courseId",
  authMiddleware(["Teacher"]),
  TeacherController.getCourseDetails
);
router.post(
  "/courses/:courseId/content",
  authMiddleware(["Teacher"]),
  TeacherController.addCourseContent
);
router.post(
  "/courses/:courseId/revision-questions",
  authMiddleware(["Teacher"]),
  TeacherController.addRevisionQuestions
);
router.delete(
  "/courses/:courseId/content/:contentId",
  authMiddleware(["Teacher"]),
  TeacherController.deleteCourseContent
);
router.delete(
  "/courses/:courseId/revision-questions/:questionId",
  authMiddleware(["Teacher"]),
  TeacherController.deleteRevisionQuestions
);
router.post(
  "/courses/:courseId/assignments",
  authMiddleware(["Teacher"]),
  TeacherController.createAssignment
);
router.put(
  "/assignments/:assignmentId",
  authMiddleware(["Teacher"]),
  TeacherController.updateAssignment
);
router.delete(
  "/assignments/:assignmentId",
  authMiddleware(["Teacher"]),
  TeacherController.deleteAssignment
);

router.get(
  "/assignments/:assignmentId/details",
  authMiddleware(["Teacher"]),
  TeacherController.getAssignmentDetailsForTeacher
);

router.get(
  "/deadlines/upcoming",
  authMiddleware(["Teacher"]),
  TeacherController.getUpcomingDeadlines
);
export default router;
