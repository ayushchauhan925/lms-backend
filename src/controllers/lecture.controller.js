const Lecture = require("../models/Lecture");
const Course = require("../models/Course");
const Enrollment = require("../models/Enrollment");

exports.createLecture = async (req, res) => {
  try {
    const {
      courseId,
      title,
      lectureDescription,
      order,
      isPreview,
      videoUrl,
      videoPublicId,
      duration,
    } = req.body;

    if (!courseId || !title || order === undefined || !videoUrl || !videoPublicId) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    if (course.educatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to add lecture to this course",
      });
    }

    const existingLecture = await Lecture.findOne({ courseId, order });
    if (existingLecture) {
      return res.status(400).json({
        message: "Lecture order already exists in this course",
      });
    }

    const lecture = await Lecture.create({
      courseId,
      title,
      lectureDescription,
      order,
      isPreview: isPreview || false,
      videoUrl,
      videoPublicId,
      duration: duration || 0,
    });

    res.status(201).json({
      message: "Lecture created successfully",
      lecture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLecturesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);

    // ── removed isPublished check so draft courses work too ──
    if (!course) {
      return res.status(404).json({ message: "Course not found" });
    }

    let lectures;

    if (
      req.user.role === "educator" &&
      course.educatorId.toString() === req.user._id.toString()
    ) {
      // Educator who owns the course — get all lectures
      lectures = await Lecture.find({ courseId }).sort({ order: 1 });
    } else {
      const enrollment = await Enrollment.findOne({
        studentId: req.user._id,
        courseId,
        status: "active",
      });

      if (!enrollment) {
        // Not enrolled — only free preview lectures
        lectures = await Lecture.find({
          courseId,
          isPreview: true,
        }).sort({ order: 1 });
      } else {
        // Enrolled — all lectures
        lectures = await Lecture.find({ courseId }).sort({ order: 1 });
      }
    }

    res.status(200).json(lectures);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getLectureById = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const course = await Course.findById(lecture.courseId);

    if (
      req.user.role === "educator" &&
      course.educatorId.toString() === req.user._id.toString()
    ) {
      return res.status(200).json(lecture);
    }

    if (lecture.isPreview) {
      return res.status(200).json(lecture);
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId: lecture.courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must enroll in this course to access this lecture",
      });
    }

    res.status(200).json(lecture);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const course = await Course.findById(lecture.courseId);

    if (course.educatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to update this lecture",
      });
    }

    const updatedLecture = await Lecture.findByIdAndUpdate(
      lectureId,
      req.body,
      { new: true }
    );

    res.status(200).json({
      message: "Lecture updated successfully",
      lecture: updatedLecture,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteLecture = async (req, res) => {
  try {
    const { lectureId } = req.params;

    const lecture = await Lecture.findById(lectureId);
    if (!lecture) {
      return res.status(404).json({ message: "Lecture not found" });
    }

    const course = await Course.findById(lecture.courseId);

    if (course.educatorId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        message: "Not authorized to delete this lecture",
      });
    }

    await lecture.deleteOne();

    res.status(200).json({
      message: "Lecture deleted successfully",
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};