const User = require("../models/User");
const { getScreenshotModel } = require("../models/ScreenshotModelFactory");

exports.getScreenshotList = async (req, res) => {
  try {
    const host = `${req.protocol}://${req.get("host")}`;

    if (req.user && req.user.role === "Admin") {
      // Admin: get all users' screenshots with email and phone
      const users = await User.find({}, "_id email phone");
      const allScreenshots = [];

      for (const user of users) {
        const ScreenshotModel = getScreenshotModel(user._id.toString());
        const screenshots = await ScreenshotModel.find().sort({
          uploadedAt: -1,
        });

        const screenshotsWithUrl = screenshots.map((screenshot) => ({
          _id: screenshot._id,
          filename: screenshot.filename,
          path: `${host}/screenshots/uploads/${user._id}/${screenshot.filename}`,
          uploadedAt: screenshot.uploadedAt,
        }));

        if (screenshotsWithUrl.length > 0) {
          allScreenshots.push({
            userId: user._id,
            email: user.email,
            phone: user.phone,
            screenshots: screenshotsWithUrl,
          });
        }
      }

      return res.status(200).json({
        message: "All users' screenshots retrieved successfully",
        data: allScreenshots,
      });
    }

    // Non-admin: only return logged-in user's screenshots (userId from token)
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

    const ScreenshotModel = getScreenshotModel(userId);
    const screenshots = await ScreenshotModel.find().sort({ uploadedAt: -1 });

    const screenshotsWithUrl = screenshots.map((screenshot) => ({
      _id: screenshot._id,
      filename: screenshot.filename,
      path: `${host}/screenshots/uploads/${userId}/${screenshot.filename}`,
      uploadedAt: screenshot.uploadedAt,
    }));

    return res.status(200).json({
      message: "User's screenshots retrieved successfully",
      count: screenshots.length,
      data: screenshotsWithUrl,
    });
  } catch (error) {
    console.error("Error retrieving screenshots:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
