const express = require("express");
const router = express.Router();

const userController = require("../controllers/userController");
const { protect } = require("../middleware/auth.middleware");

/**
 * @route   POST /api/users/register
 * @access  Public
 */
router.post("/register", userController.registerUser);

/**
 * @route   POST /api/users/login
 * @access  Public
 */
router.post("/login", userController.loginUser);

/**
 * @route   GET /api/users/profile
 * @access  Private
 */
router.get("/profile", protect, userController.getUserProfile);

/**
 * @route   PUT /api/users/profile
 * @access  Private
 */
router.put("/profile", protect, userController.updateUserProfile);

/**
 * @route   DELETE /api/users/:id
 * @access  Private
 */
router.delete("/:id", protect, userController.deleteUser);

module.exports = router;