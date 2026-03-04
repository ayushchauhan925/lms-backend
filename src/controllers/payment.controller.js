const Payment = require("../models/Payment");
const Course  = require("../models/Course");

// ======================================
// 1️⃣ Create Mock Payment
// ======================================
exports.createPayment = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId)
      return res.status(400).json({ success: false, message: "Course ID is required" });

    const course = await Course.findById(courseId);
    if (!course)
      return res.status(404).json({ success: false, message: "Course not found" });

    if (course.educatorId.toString() === req.user._id.toString())
      return res.status(400).json({ success: false, message: "You cannot purchase your own course" });

    const existingPayment = await Payment.findOne({
      studentId: req.user._id,
      courseId,
      paymentStatus: "success",
    });
    if (existingPayment)
      return res.status(400).json({ success: false, message: "Course already purchased" });

    const payment = await Payment.create({
      studentId:     req.user._id,
      courseId,
      amount:        course.price,
      paymentMethod: "mock",
      transactionId: `TXN_${Date.now()}`,
      paymentStatus: "success",
      paidAt:        new Date(),
    });

    res.status(201).json({ success: true, message: "Payment successful", payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 2️⃣ Get All Payments (Student Only)
// ======================================
exports.getMyPayments = async (req, res) => {
  try {
    const payments = await Payment.find({ studentId: req.user._id })
      .populate({
        path: "courseId",
        select: "title price thumbnail category",
        populate: { path: "educatorId", select: "name" },
      })
      .sort({ createdAt: -1 });

    res.json({ success: true, count: payments.length, payments });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 3️⃣ Get Payment Details For Specific Course
// ======================================
exports.getPaymentByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;

    const payment = await Payment.findOne({
      studentId: req.user._id,
      courseId,
    }).populate({
      path: "courseId",
      select: "title price thumbnail category",
      populate: { path: "educatorId", select: "name" },
    });

    if (!payment)
      return res.status(404).json({ success: false, message: "Payment not found for this course" });

    res.json({ success: true, payment });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ======================================
// 4️⃣ Get Educator Earnings  ← NEW
// ======================================
exports.getEducatorEarnings = async (req, res) => {
  try {
    // Find all courses belonging to this educator
    const courses = await Course.find(
      { educatorId: req.user._id },
      "_id title thumbnail category price"
    );

    if (!courses.length)
      return res.json({ success: true, totalEarnings: 0, totalSales: 0, payments: [], earningsByCourse: [] });

    const courseIds = courses.map((c) => c._id);

    // All successful payments for those courses
    const payments = await Payment.find({
      courseId:      { $in: courseIds },
      paymentStatus: "success",
    })
      .populate("studentId", "name email")
      .populate("courseId",  "title thumbnail category price")
      .sort({ paidAt: -1 });

    // Total earnings & sales
    const totalEarnings = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalSales    = payments.length;

    // Earnings broken down per course
    const earningsByCourse = courses.map((course) => {
      const coursePays = payments.filter(
        (p) => p.courseId?._id?.toString() === course._id.toString()
      );
      return {
        courseId:  course._id,
        title:     course.title,
        thumbnail: course.thumbnail,
        category:  course.category,
        price:     course.price,
        sales:     coursePays.length,
        earnings:  coursePays.reduce((sum, p) => sum + p.amount, 0),
      };
    }).filter((c) => c.sales > 0) // only courses with at least one sale
      .sort((a, b) => b.earnings - a.earnings);

    res.json({ success: true, totalEarnings, totalSales, payments, earningsByCourse });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};