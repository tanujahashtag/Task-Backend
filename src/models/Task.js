const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    task_name: { type: String, required: true },
    description: { type: String, required: true },
    assigned_to: { type: String, required: true },
    due_date: { type: Date, required: true },
    project_name: { type: String, required: true },
    project_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Project",
    },
    user_id: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // 👈 important!

    status: { type: String, required: true, default: "Not Started" },
    task_timer_id: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
