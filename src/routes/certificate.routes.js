const express = require("express");
const router = express.Router();

const {
  issueCertificate,
  getMyCertificate,
  verifyCertificate,
} = require("../controllers/certificate.controller");

const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");

router.post(
  "/issue",
  protect,
  allowRoles("student"),
  issueCertificate
);

router.get(
  "/:courseId",
  protect,
  allowRoles("student"),
  getMyCertificate
);

router.get(
  "/verify/:certificateNumber",
  verifyCertificate
);

module.exports = router;