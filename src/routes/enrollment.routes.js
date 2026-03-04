const express = require("express");
const router  = express.Router();

const enrollmentController = require("../controllers/enrollment.controller");
const { protect }          = require("../middleware/auth.middleware");
const { allowRoles }       = require("../middleware/role.middleware");

// Student: enroll in a course
router.post(
  "/",
  protect,
  allowRoles("student"),
  enrollmentController.enrollInCourse
);

// Student: get own enrollments
router.get(
  "/my",
  protect,
  allowRoles("student"),
  enrollmentController.getMyEnrollments
);

// Educator: all enrollments across all courses ← NEW (must be before /:courseId)
router.get(
  "/educator/all",
  protect,
  allowRoles("educator"),
  enrollmentController.getEducatorEnrollments
);

// Educator: enrollments for one specific course
router.get(
  "/course/:courseId",
  protect,
  allowRoles("educator"),
  enrollmentController.getCourseEnrollments
);

module.exports = router;