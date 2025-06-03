const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");
const User = require("../models/User");
const cloudinary = require("../config/cloudinary");
const { Readable } = require("stream");
const streamifier = require("streamifier");

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

// multer with memory storage to get req.file.buffer
const storage = multer.memoryStorage();
const upload = multer({ storage }).single("screenshot");

exports.uploadScreenshot = async (req, res) => {
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

      // Find user by ID to get username
      const user = await User.findById(userId);
      if (!user || !user.username) {
        return res
          .status(404)
          .json({ message: "User not found or username missing" });
      }
      const username = user.username;

      // Upload buffer to Cloudinary in user-specific folder
      const uploadResult = await new Promise((resolve, reject) => {
        const uploadStream = cloudinary.uploader.upload_stream(
          { folder: `screenshots/${username}` }, // save in user folder on Cloudinary
          (error, result) => {
            if (error) return reject(error);
            resolve(result);
          }
        );
        streamifier.createReadStream(req.file.buffer).pipe(uploadStream);
      });

      // Save metadata in user-specific screenshot collection
      const ScreenshotModel = getScreenshotModel(username);
      const screenshot = new ScreenshotModel({
        filename: uploadResult.public_id,
        path: uploadResult.secure_url,
        uploadedAt: new Date(),
      });
      await screenshot.save();

      res.status(200).json({
        message: "Screenshot uploaded and saved successfully",
        data: {
          filename: screenshot.filename,
          path: uploadResult.secure_url,
          uploadedAt: screenshot.uploadedAt,
        },
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

    // Get screenshot model and data
    const ScreenshotModel = getScreenshotModel(username);
    const screenshots = await ScreenshotModel.find().sort({ uploadedAt: -1 });

    const screenshotsWithUrl = screenshots.map((screenshot) => ({
      _id: screenshot._id,
      filename: screenshot.filename,
      path: screenshot.path,
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
