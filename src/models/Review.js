// src/models/Review.js

const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    comment: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    isApproved: {
      type: Boolean,
      default: true, // moderation can be added later
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

// 🔒 One student can review one course only once
reviewSchema.index({ studentId: 1, courseId: 1 }, { unique: true });

// 📊 Fetch latest reviews per course efficiently
reviewSchema.index({ courseId: 1, createdAt: -1 });

module.exports = mongoose.model("Review", reviewSchema);