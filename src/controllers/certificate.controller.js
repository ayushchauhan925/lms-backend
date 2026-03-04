const Certificate = require("../models/Certificate");
const Progress = require("../models/Progress");
const Enrollment = require("../models/Enrollment");
const Course = require("../models/Course");
const crypto = require("crypto");

exports.issueCertificate = async (req, res) => {
  try {
    const { courseId } = req.body;

    if (!courseId) {
      return res.status(400).json({ message: "courseId required" });
    }

    const enrollment = await Enrollment.findOne({
      studentId: req.user._id,
      courseId,
      status: "active",
    });

    if (!enrollment) {
      return res.status(403).json({
        message: "You must enroll in course",
      });
    }

    const progress = await Progress.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (!progress || progress.progressPercentage < 100) {
      return res.status(400).json({
        message: "Course not completed yet",
      });
    }

    const existingCertificate = await Certificate.findOne({
      studentId: req.user._id,
      courseId,
    });

    if (existingCertificate) {
      return res.status(200).json({
        message: "Certificate already issued",
        certificate: existingCertificate,
      });
    }

    const certificateNumber =
      "CERT-" + crypto.randomBytes(6).toString("hex").toUpperCase();

    const certificate = await Certificate.create({
      studentId: req.user._id,
      courseId,
      certificateNumber,
      certificateUrl: "",
    });

    res.status(201).json({
      message: "Certificate issued successfully",
      certificate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getMyCertificate = async (req, res) => {
  try {
    const { courseId } = req.params;

    const certificate = await Certificate.findOne({
      studentId: req.user._id,
      courseId,
    }).populate("courseId", "title");

    if (!certificate) {
      return res.status(404).json({
        message: "Certificate not found",
      });
    }

    res.status(200).json(certificate);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.verifyCertificate = async (req, res) => {
  try {
    const { certificateNumber } = req.params;

    const certificate = await Certificate.findOne({
      certificateNumber,
      status: "issued",
    })
      .populate("studentId", "name email")
      .populate("courseId", "title");

    if (!certificate) {
      return res.status(404).json({
        message: "Invalid certificate",
      });
    }

    res.status(200).json({
      valid: true,
      certificate,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};