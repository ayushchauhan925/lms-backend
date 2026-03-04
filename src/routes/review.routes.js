const express = require("express");
const router  = express.Router();

const {
  createReview,
  getMyReviews,
  updateReview,
  deleteReview,
  getCourseReviews,
  getEducatorCourseReviews,
} = require("../controllers/review.controller");

const { protect }    = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

// ⚠️  Static routes (/my, /educator) MUST come before dynamic routes (/:reviewId, /course/:courseId)

// Student: get own reviews
router.get("/my",     protect, allowRoles("student"),  getMyReviews);

// Educator: get reviews for their own course (ownership verified in controller)
router.get("/educator/course/:courseId", protect, allowRoles("educator"), getEducatorCourseReviews);

// Student: submit a review
router.post("/",      protect, allowRoles("student"),  createReview);

// Student: update / delete own review
router.put("/:reviewId",    protect, updateReview);
router.delete("/:reviewId", protect, deleteReview);

// Public: get approved reviews for a course
router.get("/course/:courseId", getCourseReviews);

module.exports = router;