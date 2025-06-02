const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");
const User = require("../models/User");

// Cache for dynamic models
const modelCache = {};

// Get Screenshot Model using username
const getScreenshotModel = (username) => {
  const modelName = `${username}_screenshot`;

  if (modelCache[modelName]) return modelCache[modelName];

  const schema = new mongoose.Schema({
    filename: String,
    path: String,
    uploadedAt: { type: Date, default: Date.now },
  });

  modelCache[modelName] =
    mongoose.models[modelName] || mongoose.model(modelName, schema);
  return modelCache[modelName];
};

// Upload Screenshot
exports.uploadScreenshot = async (req, res) => {
  const tempDir = path.join(__dirname, "../uploads/screenshots/temp");
  fs.mkdirSync(tempDir, { recursive: true });

  const storage = multer.diskStorage({
    destination: tempDir,
    filename: (req, file, cb) => {
      cb(null, `temp-${Date.now()}.png`);
    },
  });

  const upload = multer({ storage }).single("screenshot");

  upload(req, res, async (err) => {
    if (err) {
      return res
        .status(400)
        .json({ message: "File upload failed", error: err.message });
    }

    try {
      const userId = req.body?.userId || req.user?.id;
      if (!userId) {
        return res.status(400).json({ message: "User ID is required" });
      }

      // Get user and username
      const user = await User.findById(userId);
      if (!user || !user.username) {
        return res
          .status(404)
          .json({ message: "User not found or username missing" });
      }

      const username = user.username;

      // Create user-specific directory
      const userDir = path.join(__dirname, "../uploads/screenshots", username);
      fs.mkdirSync(userDir, { recursive: true });

      // Move and rename the uploaded file
      const newFilename = `screenshot-${Date.now()}.png`;
      const oldPath = path.join(tempDir, req.file.filename);
      const newPath = path.join(userDir, newFilename);
      fs.renameSync(oldPath, newPath);

      // Save screenshot metadata
      const ScreenshotModel = getScreenshotModel(username);
      const screenshot = new ScreenshotModel({
        filename: newFilename,
        path: `/uploads/screenshots/${username}/${newFilename}`,
      });
      await screenshot.save();

      res.status(200).json({
        message: "Screenshot uploaded successfully",
        filename: newFilename,
        path: screenshot.path,
      });
    } catch (error) {
      console.error("Screenshot upload error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
};

// Get all screenshots for a user
exports.getScreenshot = async (req, res) => {
  try {
    const userId = req.params.userId || req.body?.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    // Get user and username
    const user = await User.findById(userId);
    if (!user || !user.username) {
      return res
        .status(404)
        .json({ message: "User not found or username missing" });
    }

    const username = user.username;

    // Get scre enshot model and data
    const ScreenshotModel = getScreenshotModel(username);
    const screenshots = await ScreenshotModel.find().sort({ uploadedAt: -1 });

    const host = `${req.protocol}://${req.get("host")}`;
    const screenshotsWithUrl = screenshots.map((screenshot) => ({
      _id: screenshot._id,
      filename: screenshot.filename,
      path: `${host}/uploads/screenshots/${username}/${screenshot.filename}`,
      uploadedAt: screenshot.uploadedAt,
    }));

    res.status(200).json({
      message: "Screenshots retrieved successfully",
      count: screenshots.length,
      data: screenshotsWithUrl,
    });
  } catch (error) {
    console.error("Error retrieving screenshots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
