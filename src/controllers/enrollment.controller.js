const Enrollment = require("../models/Enrollment");
const Payment    = require("../models/Payment");
const Course     = require("../models/Course");

// ======================================
// 1️⃣ Enroll In Course (Student)
// ======================================
exports.enrollInCourse = async (req, res) => {
  try {
    const { courseId } = req.body;

    const course = await Course.findById(courseId);
    if (!course || !course.isPublished)
      return res.status(404).json({ success: false, message: "Course not available" });

    const payment = await Payment.findOne({
      studentId: req.user._id, courseId, paymentStatus: "success",
    });
    if (!payment)
      return res.status(400).json({ success: false, message: "Payment required before enrollment" });

    const existing = await Enrollment.findOne({ studentId: req.user._id, courseId });
    if (existing)
      return res.status(400).json({ success: false, message: "Already enrolled" });

    const enrollment = await Enrollment.create({
      studentId:  req.user._id,
      courseId,
      amountPaid: payment.amount,
    });

    res.status(201).json({ success: true, message: "Enrollment successful", enrollment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 2️⃣ Get My Enrolled Courses (Student)
// ======================================
exports.getMyEnrollments = async (req, res) => {
  try {
    const enrollments = await Enrollment.find({ studentId: req.user._id })
      .populate("courseId", "title price thumbnail isPublished")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 3️⃣ Get Enrollments For One Course (Educator)
// ======================================
exports.getCourseEnrollments = async (req, res) => {
  try {
    const { courseId } = req.params;

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    if (course.educatorId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: "Access denied" });

    const enrollments = await Enrollment.find({ courseId })
      .populate("studentId", "name email")
      .sort({ createdAt: -1 });

    res.json({ success: true, count: enrollments.length, enrollments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 4️⃣ Get All Enrollments Across All Educator Courses ← NEW
// ======================================
exports.getEducatorEnrollments = async (req, res) => {
  try {
    // Find all courses owned by this educator
    const courses = await Course.find(
      { educatorId: req.user._id },
      "_id title thumbnail category"
    );

    if (!courses.length)
      return res.json({ success: true, totalEnrollments: 0, enrollments: [], enrollmentsByCourse: [] });

    const courseIds = courses.map((c) => c._id);

    // All enrollments for those courses
    const enrollments = await Enrollment.find({ courseId: { $in: courseIds } })
      .populate("studentId", "name email avatarUrl")
      .populate("courseId",  "title thumbnail category")
      .sort({ enrolledAt: -1 });

    // Per-course breakdown
    const enrollmentsByCourse = courses.map((course) => {
      const list = enrollments.filter(
        (e) => e.courseId?._id?.toString() === course._id.toString()
      );
      return {
        courseId:  course._id,
        title:     course.title,
        thumbnail: course.thumbnail,
        category:  course.category,
        count:     list.length,
      };
    }).filter((c) => c.count > 0)
      .sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      totalEnrollments: enrollments.length,
      enrollments,
      enrollmentsByCourse,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};