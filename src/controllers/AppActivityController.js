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

    // 1. Find existing temp entries for this user/app
    const existingTempEntries = await TempAppActivity.find({ userID, appName });

    // 2. Calculate duration for new entry
    const newEntryDuration = Math.floor((newClosedAt - newOpenedAt) / 1000); // in seconds

    // 3. Calculate total duration from existing temp entries
    let existingDuration = 0;
    if (existingTempEntries.length > 0) {
      for (const entry of existingTempEntries) {
        const o = new Date(entry.openedAt);
        const c = new Date(entry.closedAt);
        existingDuration += Math.floor((c - o) / 1000);
      }

      // 4. Delete all previous temp entries (now consolidated)
      await TempAppActivity.deleteMany({ userID, appName });
    }

    // 5. Save the new temp entry
    await TempAppActivity.create({
      userID,
      appName,
      title,
      openedAt: newOpenedAt,
      closedAt: newClosedAt,
    });

    // 6. Get or create FinalAppActivity for the user
    let finalDoc = await FinalAppActivity.findOne({ userID });
    const now = new Date();
    const newEntryDateStr = newOpenedAt.toISOString().split("T")[0]; // YYYY-MM-DD

    if (!finalDoc) {
      // Create new final doc with first activity
      finalDoc = new FinalAppActivity({
        userID,
        activity: [
          {
            appName,
            title,
            duration: existingDuration + newEntryDuration,
            createdAt: newOpenedAt,
            updatedAt: now,
          },
        ],
      });
    } else {
      // Check if any activity for same appName and same day exists
      const idx = finalDoc.activity.findIndex((a) => {
        const aDateStr = new Date(a.createdAt).toISOString().split("T")[0];
        return a.appName === appName && aDateStr === newEntryDateStr;
      });

      if (idx > -1) {
        // Update existing same-day activity
        finalDoc.activity[idx].duration += newEntryDuration;
        finalDoc.activity[idx].title = title;
        finalDoc.activity[idx].updatedAt = now;
      } else {
        // Add new activity entry for different day
        finalDoc.activity.push({
          appName,
          title,
          duration: existingDuration + newEntryDuration,
          createdAt: newOpenedAt,
          updatedAt: now,
        });
      }
    }

    // 7. Save the final doc
    await finalDoc.save();

    return res.status(200).json({ message: "Activity processed successfully" });
  } catch (error) {
    console.error("Error processing app activity:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

exports.getActivity = async (req, res) => {
  try {
    const userID = req.params.userID;
    if (!userID) {
      return res.status(400).json({ message: "userID is required in URL" });
    }

    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);
    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    const finalActivityDoc = await FinalAppActivity.findOne({ userID });

    if (!finalActivityDoc) {
      return res
        .status(404)
        .json({ message: "No activities found for this user" });
    }

    const todayActivities = finalActivityDoc.activity.filter((activity) => {
      const createdAt = new Date(activity.createdAt);
      return createdAt >= startOfDay && createdAt <= endOfDay;
    });

    const formattedActivities = todayActivities.map((activity) => {
      const durationInSeconds = activity.duration || 0;
      const hours = Math.floor(durationInSeconds / 3600);
      const minutes = Math.floor((durationInSeconds % 3600) / 60);
      return {
        appName: activity.appName,
        title: activity.title,
        duration: durationInSeconds,
        readableDuration: `${hours}h ${minutes}m`,
        createdAt: activity.createdAt,
        updatedAt: activity.updatedAt,
      };
    });

    // Find today's idle time entry by matching date (ignoring time)
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayIdleEntry = finalActivityDoc.totalIdleTime.find((entry) => {
      const entryDate = new Date(entry.date);
      entryDate.setHours(0, 0, 0, 0);
      return entryDate.getTime() === today.getTime();
    });

    return res.status(200).json({
      success: true,
      data: {
        _id: finalActivityDoc._id,
        userID: finalActivityDoc.userID,
        activity: formattedActivities,
        totalIdleTime: todayIdleEntry || {
          seconds: 0,
          readable: "0h 0m",
          date: today,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching activities:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

exports.saveIdealTime = async (req, res) => {
  try {
    const { userID, idleSeconds } = req.body;
    if (!userID || idleSeconds == null) {
      return res
        .status(400)
        .json({ message: "userID and idleSeconds are required" });
    }

    const hours = Math.floor(idleSeconds / 3600);
    const minutes = Math.floor((idleSeconds % 3600) / 60);
    const readable = `${hours}h ${minutes}m`;

    const today = new Date();
    today.setHours(0, 0, 0, 0); // normalize to start of day

    let finalDoc = await FinalAppActivity.findOne({ userID });

    if (!finalDoc) {
      finalDoc = new FinalAppActivity({
        userID,
        totalIdleTime: [{ date: today, seconds: idleSeconds, readable }],
      });
    } else {
      // Find index for today's date ignoring time
      const idx = finalDoc.totalIdleTime.findIndex((entry) => {
        const entryDate = new Date(entry.date);
        entryDate.setHours(0, 0, 0, 0);
        return entryDate.getTime() === today.getTime();
      });

      if (idx > -1) {
        // Update existing
        finalDoc.totalIdleTime[idx].seconds = idleSeconds;
        finalDoc.totalIdleTime[idx].readable = readable;
      } else {
        // Add new entry
        finalDoc.totalIdleTime.push({
          date: today,
          seconds: idleSeconds,
          readable,
        });
      }
    }

    await finalDoc.save();

    return res.status(200).json({
      success: true,
      message: "Idle time saved successfully",
      idleTime: { date: today, seconds: idleSeconds, readable },
    });
  } catch (error) {
    console.error("Error saving idle time:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
