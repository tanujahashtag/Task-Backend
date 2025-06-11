const TempAppActivity = require("../models/TempAppActivity");
const FinalAppActivity = require("../models/FinalAppActivity");

exports.addActivity = async (req, res) => {
  try {
    const { userID, appName, title, openedAt, closedAt } = req.body;

    if (!userID || !appName || !openedAt || !closedAt) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const newOpenedAt = new Date(openedAt);
    const newClosedAt = new Date(closedAt);

    if (isNaN(newOpenedAt) || isNaN(newClosedAt)) {
      return res
        .status(400)
        .json({ message: "Invalid openedAt or closedAt date format" });
    }

    // Step 1: Get existing entries for this app and user from Temp collection
    const existingTempEntries = await TempAppActivity.find({ userID, appName });

    // Step 2: Calculate total duration including new entry
    let totalDuration = Math.floor((newClosedAt - newOpenedAt) / 1000); // in seconds

    if (existingTempEntries.length > 0) {
      for (const entry of existingTempEntries) {
        const o = new Date(entry.openedAt);
        const c = new Date(entry.closedAt);
        totalDuration += Math.floor((c - o) / 1000);
      }

      // Step 3: Delete all previous temp entries for this app/user
      await TempAppActivity.deleteMany({ userID, appName });
    }

    // Step 4: Save new entry to TempAppActivity
    await TempAppActivity.create({
      userID,
      appName,
      title,
      openedAt: newOpenedAt,
      closedAt: newClosedAt,
    });

    // Step 5: Upsert (insert or update) into FinalAppActivity
    await FinalAppActivity.findOneAndUpdate(
      { userID, appName },
      {
        $setOnInsert: { title },
        $inc: { duration: totalDuration }, // add new duration
      },
      { upsert: true, new: true }
    );

    res.status(200).json({ message: "Activity processed successfully" });
  } catch (error) {
    console.error("Error processing app activity:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const userID = req.params.userID;

    if (!userID) {
      return res.status(400).json({ message: "userID is required in URL" });
    }

    const activities = await FinalAppActivity.find({ userID });

    // Map and add readableDuration
    const formattedActivities = activities.map((activity) => {
      const durationInSeconds = activity.duration || 0;
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);

      return {
        _id: activity._id,
        appName: activity.appName,
        title: activity.title,
        userID: activity.userID,
        duration: durationInSeconds,
        readableDuration: `${hours}h ${minutes}m`,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      };
    });

    return res.status(200).json({
      success: true,
      data: formattedActivities,
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
