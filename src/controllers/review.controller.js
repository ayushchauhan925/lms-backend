const mongoose = require("mongoose");
const Review = require("../models/Review");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

/*
------------------------------------------------
Helper: Recalculate Course Rating
------------------------------------------------
*/
const updateCourseRating = async (courseId) => {
  const stats = await Review.aggregate([
    { $match: { courseId: new mongoose.Types.ObjectId(courseId), isApproved: true } },
    { $group: { _id: "$courseId", avgRating: { $avg: "$rating" }, totalReviews: { $sum: 1 } } },
  ]);

  if (stats.length > 0) {
    await Course.findByIdAndUpdate(courseId, {
      averageRating: Number(stats[0].avgRating.toFixed(1)),
      totalReviews: stats[0].totalReviews,
    });
  } else {
    await Course.findByIdAndUpdate(courseId, { averageRating: 0, totalReviews: 0 });
  }
};

/*
------------------------------------------------
Create Review
------------------------------------------------
*/
const createReview = async (req, res) => {
  try {
    const { courseId, rating, comment } = req.body;

    if (req.user.role !== "student") {
      return res.status(403).json({ success: false, message: "Only students can create reviews" });
    }
    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
    }

    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ success: false, message: "Course not found" });

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
      status: { $in: ["active", "completed"] },
    });
    if (!enrollment) {
      return res.status(403).json({ success: false, message: "You must be enrolled in this course to review it" });
    }

    const existingReview = await Review.findOne({ studentId: req.user._id, courseId });
    if (existingReview) {
      return res.status(400).json({ success: false, message: "You have already reviewed this course" });
    }

    const review = await Review.create({ studentId: req.user._id, courseId, rating, comment });
    await updateCourseRating(courseId);

    res.status(201).json({ success: true, message: "Review submitted successfully", data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while creating review" });
  }
};

/*
------------------------------------------------
Get My Reviews (Student)
------------------------------------------------
*/
const getMyReviews = async (req, res) => {
  try {
    const reviews = await Review.find({ studentId: req.user._id })
      .populate("courseId", "title thumbnail")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while fetching your reviews" });
  }
};

/*
------------------------------------------------
Update Review
------------------------------------------------
*/
const updateReview = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { rating, comment } = req.body;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    if (review.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only update your own review" });
    }

    if (rating !== undefined) {
      if (rating < 1 || rating > 5) {
        return res.status(400).json({ success: false, message: "Rating must be between 1 and 5" });
      }
      review.rating = rating;
    }
    if (comment !== undefined) review.comment = comment;

    await review.save();
    await updateCourseRating(review.courseId);

    res.status(200).json({ success: true, message: "Review updated successfully", data: review });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while updating review" });
  }
};

/*
------------------------------------------------
Delete Review
------------------------------------------------
*/
const deleteReview = async (req, res) => {
  try {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
      return res.status(400).json({ success: false, message: "Invalid review ID" });
    }

    const review = await Review.findById(reviewId);
    if (!review) return res.status(404).json({ success: false, message: "Review not found" });

    if (review.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "You can only delete your own review" });
    }

    const courseId = review.courseId;
    await review.deleteOne();
    await updateCourseRating(courseId);

    res.status(200).json({ success: true, message: "Review deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while deleting review" });
  }
};

/*
------------------------------------------------
Get Reviews For Course (Public)
------------------------------------------------
*/
const getCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const reviews = await Review.find({ courseId, isApproved: true })
      .populate("studentId", "name avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while fetching reviews" });
  }
};

/*
------------------------------------------------
Get Reviews For Educator's Own Course (Protected)
Verifies the requesting educator owns the course
before returning all reviews (approved + pending)
------------------------------------------------
*/
const getEducatorCourseReviews = async (req, res) => {
  try {
    const { courseId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(courseId)) {
      return res.status(400).json({ success: false, message: "Invalid course ID" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ success: false, message: "Course not found" });
    }

    // Ownership check — educator can only view reviews of their own courses
    if (course.educatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const reviews = await Review.find({ courseId })
      .populate("studentId", "name avatarUrl")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: reviews.length, data: reviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error while fetching course reviews" });
  }
};

module.exports = {
  createReview,
  getMyReviews,
  updateReview,
  deleteReview,
  getCourseReviews,
  getEducatorCourseReviews,
};