const express = require("express");
const router = express.Router();

const {
  markLectureCompleted,
  getCourseProgress,
  getMyProgress,
} = require("../controllers/progress.controller");

const { protect }    = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

router.post(
  "/complete",
  protect,
  allowRoles("student"),
  markLectureCompleted
);

// ── NEW: get all progress for logged-in student ──
router.get(
  "/my",
  protect,
  allowRoles("student"),
  getMyProgress
);

// ⚠️ Keep /my ABOVE /:courseId — Express matches routes top-down
router.get(
  "/:courseId",
  protect,
  allowRoles("student"),
  getCourseProgress
);

module.exports = router;