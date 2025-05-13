const TaskTimer = require("../models/TaskTimer");
const TimerCycle = require("../models/TimerCycle");
const Task = require("../models/Task");

// Start timer
exports.startTimer = async (req, res) => {
  const { task_id, user_id } = req.body;
  if (!task_id || !user_id) {
    return res.status(400).json({ error: "task_id and user_id are required" });
  }

  // Check if a timer already exists for the task
  const existingTimer = await TaskTimer.findOne({ task_id });

  if (existingTimer) {
    return res.status(409).json({
      error: "A timer already exists for this task.",
      existingTimer,
    });
  }

  const newTimer = await TaskTimer.create({
    task_id,
    user_id,
    start_time: new Date(),
  });
  await Task.updateOne({ _id: task_id }, { $set: { status: "In Progress" } });

  res.json(newTimer);
};

// Pause timer
exports.pauseTimer = async (req, res) => {
  const { task_timer_id } = req.body;
  if (!task_timer_id)
    return res.status(400).json({ error: "task_timer_id is required" });

  const pause = await TimerCycle.create({
    task_timer_id,
    pause_time: new Date(),
  });
  // Find task_id from TaskTimer
  const timer = await TaskTimer.findById(task_timer_id);
  if (timer && timer.task_id) {
    await Task.updateOne(
      { _id: timer.task_id },
      { $set: { status: "Paused" } }
    );
  }

  res.json(pause);
};

// Resume timer
exports.resumeTimer = async (req, res) => {
  const { task_timer_id } = req.body;
  if (!task_timer_id)
    return res.status(400).json({ error: "task_timer_id is required" });

  const cycle = await TimerCycle.findOne({
    task_timer_id,
    resume_time: null,
  }).sort({ pause_time: -1 });

  if (!cycle) {
    return res
      .status(404)
      .json({ error: "No paused cycle found for this task." });
  }

  const resumeTime = new Date();
  const duration = Math.floor((resumeTime - cycle.pause_time) / 1000); // seconds

  await TimerCycle.updateOne(
    { _id: cycle._id },
    { $set: { resume_time: resumeTime, duration } }
  );

  const updatedTimer = await TaskTimer.updateOne(
    { _id: task_timer_id },
    { $inc: { duration } }
  );
  // Find task_id from TaskTimer and update Task status
  const timer = await TaskTimer.findById(task_timer_id);
  if (timer && timer.task_id) {
    await Task.updateOne(
      { _id: timer.task_id },
      { $set: { status: "In Progress" } }
    );
  }

  res.json({
    resume_time: resumeTime,
    added_duration: duration,
    total_duration: updatedTimer.duration,
  });
};

// Stop timer
exports.stopTimer = async (req, res) => {
  const { task_timer_id } = req.body;
  const timer = await TaskTimer.findById(task_timer_id);
  if (!timer) return res.status(404).json({ error: "Timer not found" });

  const now = new Date();
  const lastCycle = await TimerCycle.findOne({ task_timer_id }).sort({
    pause_time: -1,
  });

  const latestResume = lastCycle?.resume_time || timer.start_time;
  const additionalDuration = Math.floor((now - latestResume) / 1000); // seconds

  timer.end_time = now;
  timer.duration += additionalDuration;
  await timer.save();

  // Update associated Task status to 'Completed'
  if (timer.task_id) {
    await Task.updateOne(
      { _id: timer.task_id },
      { $set: { status: "Completed" } }
    );
  }

  res.json(timer);
};

// Productivity report
exports.getProductivity = async (req, res) => {
  const { user_id, range } = req.query;
  if (!user_id || !range)
    return res.status(400).json({ error: "user_id and range are required" });

  const now = new Date();
  let start;

  if (range === "daily") {
    start = new Date(now.setHours(0, 0, 0, 0));
  } else if (range === "weekly") {
    const day = now.getDay();
    start = new Date(now);
    start.setDate(now.getDate() - day);
    start.setHours(0, 0, 0, 0);
  } else if (range === "monthly") {
    start = new Date(now.getFullYear(), now.getMonth(), 1);
  } else {
    return res.status(400).json({ error: "Invalid range" });
  }

  const timers = await TaskTimer.find({
    user_id,
    start_time: { $gte: start },
  });

  const totalSeconds = timers.reduce(
    (sum, timer) => sum + (timer.duration || 0),
    0
  );
  const totalMinutes = Math.floor(totalSeconds / 60);
  const totalHours = (totalMinutes / 60).toFixed(2);

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  const readableTime = `${hours}h ${minutes}m`;

  const expectedSeconds =
    range === "daily"
      ? 8 * 60 * 60
      : range === "weekly"
      ? 8 * 60 * 60 * 5
      : 8 * 60 * 60 * 20;

  const productivityPercent = ((totalSeconds / expectedSeconds) * 100).toFixed(
    2
  );

  res.json({
    total_minutes: totalMinutes,
    total_hours: totalHours,
    readable_time: readableTime,
    tasks_count: timers.length,
    productivity_percent: productivityPercent,
  });
};
