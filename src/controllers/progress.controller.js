const Progress = require("../models/Progress");
const Enrollment = require("../models/Enrollment");
const Lecture = require("../models/Lecture");

exports.markLectureCompleted = async (req, res) => {
  try {
    const { courseId, lectureId } = req.body;

    if (!courseId || !lectureId) {
      return res.status(400).json({ message: "courseId and lectureId required" });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must enroll to track progress",
      });
    }

    const totalLectures = await Lecture.countDocuments({
      courseId,
      isPublished: true,
    });

    if (totalLectures === 0) {
      return res.status(400).json({
        message: "No lectures found for this course",
      });
    }

    let progress = await Progress.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!progress) {
      progress = await Progress.create({
        studentId: req.user._id,
        courseId,
        completedLectureIds: [],
      });
    }

    if (!progress.completedLectureIds.includes(lectureId)) {
      progress.completedLectureIds.push(lectureId);
    }

    progress.lastWatchedLectureId = lectureId;

    progress.progressPercentage =
      (progress.completedLectureIds.length / totalLectures) * 100;

    await progress.save();

    res.status(200).json({
      message: "Lecture marked as completed",
      progress,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getCourseProgress = async (req, res) => {
  try {
    const { courseId } = req.params;

    const progress = await Progress.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!progress) {
      return res.status(200).json({
        progressPercentage: 0,
        completedLectureIds: [],
        lastWatchedLectureId: null,
      });
    }

    res.status(200).json(progress);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

/**
 * @desc  Get all progress records for the logged-in student
 *        populated with course title, category, thumbnail, educatorId
 * @route GET /api/progress/my
 * @access Private (student)
 */
exports.getMyProgress = async (req, res) => {
  try {
    const progressList = await Progress.find({
      studentId: req.user._id,
    }).populate("courseId", "title category thumbnail educatorId level");

    res.status(200).json({ success: true, progressList });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};