const Task = require("../models/Task");

// Create and Save a Task
exports.saveTask = async (req, res, next) => {
  try {
    const { task_name, description, assigned_to, due_date, project_name ,status} =
      req.body;

    const newTask = new Task({
      task_name,
      description,
      assigned_to,
      due_date,
      project_name,
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

// Get All Tasks
exports.allTask = async (req, res, next) => {
  try {
    const tasks = await Task.find();
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

    res.status(200).json(task);
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

    res.status(200).json({ message: "Task deleted successfully" });
  } catch (error) {
    next(error);
  }
};
