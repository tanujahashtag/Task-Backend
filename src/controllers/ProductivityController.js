const TaskTimer = require("../models/TaskTimer");
const TimerCycle = require("../models/TimerCycle");
const User = require("../models/User");

exports.getProductivity = async (req, res) => {
  try {
    const userId = req.user._id;

    const users = await User.find({}, "_id email phone");

    const result = [];

    for (const user of users) {
      const timers = await TaskTimer.find({ user_id: user._id });

      let totalIdleMinutes = 0;
      const idleSpans = [];

      for (const timer of timers) {
        const cycles = await TimerCycle.find({
          task_timer_id: timer._id,
          pause_time: { $ne: null },
          resume_time: { $ne: null },
        });

        for (const cycle of cycles) {
          const pause = new Date(cycle.pause_time);
          const resume = new Date(cycle.resume_time);

          const idleMinutes = Math.floor((resume - pause) / 60000); // milliseconds to minutes
          totalIdleMinutes += idleMinutes;

          const startStr = pause.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });
          const endStr = resume.toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          });

          idleSpans.push(`${startStr} - ${endStr}`);
        }
      }

      result.push({
        userId: user._id,
        email: user.email,
        phone: user.phone,
        totalIdleMinutes,
        totalIdleHours: (totalIdleMinutes / 60).toFixed(2),
        idleTimeSpans: idleSpans,
      });
    }

    res.status(200).json({
      message: isAdmin
        ? "All users' idle productivity"
        : "User idle productivity",
      data: result,
    });
  } catch (error) {
    console.error("Error calculating idle productivity:", error);
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
