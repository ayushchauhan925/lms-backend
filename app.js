const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

// Routes
const authRoutes = require("./src/routes/authRoutes");
const userRoutes = require("./src/routes/user.routes"); // ✅ Added
const courseRoutes = require("./src/routes/course.routes");
const lectureRoutes = require("./src/routes/lecture.routes");
const paymentRoutes = require("./src/routes/payment.routes");
const enrollmentRoutes = require("./src/routes/enrollment.routes");
const progressRoutes = require("./src/routes/progress.routes");
const certificateRoutes = require("./src/routes/certificate.routes");
const reviewRoutes = require("./src/routes/review.routes");

const app = express();

/*
------------------------------------------------
Security Middlewares
------------------------------------------------
*/
app.use(helmet());

app.use(
  cors({
    origin: process.env.CLIENT_URL || "*",
    credentials: true,
  })
);

/*
------------------------------------------------
Logging
------------------------------------------------
*/
app.use(morgan("dev"));

/*
------------------------------------------------
Body Parsers
------------------------------------------------
*/
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

/*
------------------------------------------------
API Routes
------------------------------------------------
*/
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes); // ✅ Added
app.use("/api/courses", courseRoutes);
app.use("/api/lectures", lectureRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/enrollments", enrollmentRoutes);
app.use("/api/progress", progressRoutes);
app.use("/api/certificates", certificateRoutes);
app.use("/api/reviews", reviewRoutes);

/*
------------------------------------------------
Health Check
------------------------------------------------
*/
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "LMS API is running",
  });
});

/*
------------------------------------------------
404 Handler
------------------------------------------------
*/
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

/*
------------------------------------------------
Global Error Handler
------------------------------------------------
*/
app.use((err, req, res, next) => {
  console.error("Error:", err);

  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal Server Error",
  });
});

module.exports = app;