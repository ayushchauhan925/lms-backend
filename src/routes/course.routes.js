const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/auth.middleware");
const { allowRoles } = require("../middleware/role.middleware");
const courseController = require("../controllers/course.controller");

router.post(
  "/",
  protect,
  allowRoles("educator"),
  courseController.createCourse
);

router.get("/", courseController.getAllPublishedCourses);
router.get("/all", courseController.getAllCourses);
router.get("/my", protect, allowRoles("educator"), courseController.getMyCourses); // ← added
router.get("/:id", courseController.getCourseById);

router.patch(
  "/:id",
  protect,
  allowRoles("educator"),
  courseController.updateCourse
);

router.patch(
  "/:id/publish",
  protect,
  allowRoles("educator"),
  courseController.publishCourse
);

router.delete(
  "/:id",
  protect,
  allowRoles("educator"),
  courseController.deleteCourse
);

module.exports = router;