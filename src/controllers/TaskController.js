const Task = require("../models/Task");
const TaskTimer = require("../models/TaskTimer");
const TimerCycle = require("../models/TimerCycle");
// Create and Save a Task
exports.saveTask = async (req, res, next) => {
  try {
    const {
      task_name,
      description,
      assigned_to,
      due_date,
      project_name,
      project_id,
      user_id,
      status,
    } = req.body;

    const newTask = new Task({
      task_name,
      description,
      assigned_to,
      due_date,
      project_name,
      project_id,
      user_id,
      status,
    });
    await newTask.save();

    res
      .status(201)
      .json({ message: "Task created successfully", task: newTask });
  } catch (error) {
    next(error);
  }
};

// Update an existing Task
exports.updateTask = async (req, res, next) => {
  try {
    const { id } = req.params; // Task ID from URL
    const {
      task_name,
      description,
      assigned_to,
      due_date,
      project_name,
      project_id,
      user_id,
      status,
    } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      {
        task_name,
        description,
        assigned_to,
        due_date,
        project_name,
        project_id,
        user_id,
        status,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTask) {
      return res.status(404).json({ message: "Task not found" });
    }

    res
      .status(200)
      .json({ message: "Task updated successfully", task: updatedTask });
  } catch (error) {
    next(error);
  }
};

// Get All Tasks
exports.allTask = async (req, res, next) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.role.toLowerCase(); // Get the role of the user
    let tasks;

    if (role === "admin" || role === "project manager") {
      tasks = await Task.find();
    } else {
      // For other roles, find only the projects the user is assigned to
      tasks = await Task.find({ user_id: user.userId });
    }

    for (let task of tasks) {
      const timer = await TaskTimer.findOne({ task_id: task._id });
      if (timer) {
        task.task_timer_id = timer._id; // Add the task_timer_id to the task object
      } else {
        task.task_timer_id = null; // Set to null if no timer found
      }
    }
    res.status(200).json(tasks);
  } catch (error) {
    next(error);
  }
};

// Get Single Task by ID
exports.getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const task = await Task.findById(id);

    if (!task) return res.status(404).json({ message: "Task not found" });

    // Find total duration from TaskTimer(s)
    const timers = await TaskTimer.find({ task_id: id });
    const totalDuration = timers.reduce(
      (sum, timer) => sum + (timer.duration || 0),
      0
    );

    const taskTimer = await TaskTimer.findOne({ task_id: id }).sort({
      createdAt: -1,
    });

    // Attach duration info to response
    const taskWithDuration = {
      ...task.toObject(),
      task_timer_id: taskTimer ? taskTimer._id : null,
      duration_seconds: totalDuration,
      duration_minutes: Math.floor(totalDuration / 60),
      duration_hours: (totalDuration / 3600).toFixed(2),
    };

    res.status(200).json(taskWithDuration);
  } catch (error) {
    next(error);
  }
};

// Delete Task
exports.deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const deletedTask = await Task.findByIdAndDelete(id);

    if (!deletedTask)
      return res.status(404).json({ message: "Task not found" });

    // Find and delete associated TaskTimers
    const taskTimers = await TaskTimer.find({ task_id: id });

    for (const timer of taskTimers) {
      // Delete associated TimerCycles for each timer
      await TimerCycle.deleteMany({ task_timer_id: timer._id });
    }

    // Delete the TaskTimers
    await TaskTimer.deleteMany({ task_id: id });

    res
      .status(200)
      .json({ message: "Task and associated timers deleted successfully" });
  } catch (error) {
    next(error);
  }
};

// Update Task
exports.updateStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    const updatedTask = await Task.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );

    if (!updatedTask)
      return res.status(404).json({ message: "Task not found" });

    res
      .status(200)
      .json({ message: "Task status updated successfully", task: updatedTask });
  } catch (error) {
    next(error);
  }
};

exports.taskCount = async (req, res, next) => {
  try {
    const counts = await Task.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    const result = {};
    counts.forEach((item) => {
      result[item._id] = item.count;
    });

    res.status(200).json(result);
  } catch (error) {
    next(error);
  }
};
