const mongoose = require("mongoose");

const courseSchema = new mongoose.Schema(
  {
    educatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 2000,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },

    level: {
      type: String,
      enum: ["beginner", "intermediate", "advanced"],
      default: "beginner",
      index: true,
    },

    language: {
      type: String,
      default: "English",
      trim: true,
    },

    price: {
      type: Number,
      required: true,
      min: 0,
      default: 0,
      index: true,
    },

    thumbnail: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
    },

    previewVideo: {
      url: { type: String, default: "" },
      publicId: { type: String, default: "" },
      duration: { type: Number },
    },

    tags: {
      type: [String],
      default: [],
    },

    isPublished: {
      type: Boolean,
      default: true,  // ← changed from false to true
      index: true,
    },
  },
  { timestamps: true }
);

courseSchema.index({
  title: "text",
  description: "text",
  category: "text",
});

module.exports = mongoose.model("Course", courseSchema);