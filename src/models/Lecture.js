const mongoose = require("mongoose");

const lectureSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    lectureDescription: {
      type: String,
      default: "",
      trim: true,
      maxlength: 1000,
    },

    videoUrl: {
      type: String,
      required: true,
      trim: true,
    },

    videoPublicId: {
      type: String,
      required: true,
    },

    duration: {
      type: Number, // seconds
      default: 0,
      min: 0,
    },

    order: {
      type: Number,
      required: true,
    },

    isPreview: {
      type: Boolean,
      default: false,
    },

    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

lectureSchema.index({ courseId: 1, order: 1 }, { unique: true });

module.exports = mongoose.model("Lecture", lectureSchema);