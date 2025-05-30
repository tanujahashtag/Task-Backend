const express = require("express");
const router = express.Router();

const ScreenshotController = require("../controllers/ScreenshotController");

// POST
router.post("/upload-screenshot", ScreenshotController.uploadScreenshot);
router.get("/get-screenshot/:userId", ScreenshotController.getScreenshot);

module.exports = router;
