const express = require("express");
const router  = express.Router();

const paymentController = require("../controllers/payment.controller");
const { protect }       = require("../middleware/auth.middleware");
const { allowRoles }    = require("../middleware/role.middleware");

// Student: create payment
router.post(
  "/",
  protect,
  allowRoles("student"),
  paymentController.createPayment
);

// Student: get own payments
router.get(
  "/my",
  protect,
  allowRoles("student"),
  paymentController.getMyPayments
);

// Student: get payment by course
router.get(
  "/course/:courseId",
  protect,
  allowRoles("student"),
  paymentController.getPaymentByCourse
);

// Educator: get earnings dashboard  ← NEW
router.get(
  "/educator/earnings",
  protect,
  allowRoles("educator"),
  paymentController.getEducatorEarnings
);

module.exports = router;