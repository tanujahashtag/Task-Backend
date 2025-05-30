const express = require("express");
const router = express.Router();
const AdminController = require("../controllers/AdminController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get(
  "/screenshot-list",
  authenticateToken,
  AdminController.getScreenshotList
);

module.exports = router;
