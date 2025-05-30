const path = require("path");
const fs = require("fs");
const multer = require("multer");
const mongoose = require("mongoose");

// Cache for dynamic models to avoid re-declaring
const modelCache = {};

// Screenshot schema factory with caching
const getScreenshotModel = (userId) => {
  const modelName = `${userId}_screenshot`;
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

// Upload controller
exports.uploadScreenshot = async (req, res) => {
  // Use Multer to temporarily accept the file (userId isn't known yet)
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

      // Create user-specific directory
      const userDir = path.join(__dirname, "../uploads/screenshots", userId);
      fs.mkdirSync(userDir, { recursive: true });

      // Rename and move the file to the user directory
      const newFilename = `screenshot-${Date.now()}.png`;
      const oldPath = path.join(tempDir, req.file.filename);
      const newPath = path.join(userDir, newFilename);
      fs.renameSync(oldPath, newPath);

      // Save metadata in user-specific MongoDB collection
      const ScreenshotModel = getScreenshotModel(userId);
      const screenshot = new ScreenshotModel({
        filename: newFilename,
        path: `/uploads/screenshots/${userId}/${newFilename}`,
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

// Get Screenshot of Single User
exports.getScreenshot = async (req, res) => {
  try {
    const userId = req.params.userId || req.body?.userId || req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }
    const ScreenshotModel = getScreenshotModel(userId);
    const screenshots = await ScreenshotModel.find().sort({ uploadedAt: -1 });

    const host = `${req.protocol}://${req.get("host")}`;

    const screenshotsWithUrl = screenshots.map((screenshot) => ({
      _id: screenshot._id,
      filename: screenshot.filename,
      path: `${host}/screenshots/uploads/${userId}/${screenshot.filename}`, // full public URL
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



