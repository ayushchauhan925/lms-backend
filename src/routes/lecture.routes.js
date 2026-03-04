const express = require("express");
const router = express.Router();

const {
  createLecture,
  getLecturesByCourse,
  getLectureById,
  updateLecture,
  deleteLecture,
} = require("../controllers/lecture.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

// Create lecture (Educator only)
router.post(
  "/",
  protect,
  allowRoles("educator"),
  createLecture
);

// Get all lectures of a course (Authenticated users)
router.get(
  "/course/:courseId",
  protect,
  getLecturesByCourse
);

// Get single lecture (Access controlled inside controller)
router.get(
  "/:lectureId",
  protect,
  getLectureById
);

// Update lecture (Educator only)
router.put(
  "/:lectureId",
  protect,
  allowRoles("educator"),
  updateLecture
);

// Delete lecture (Educator only)
router.delete(
  "/:lectureId",
  protect,
  allowRoles("educator"),
  deleteLecture
);

module.exports = router;