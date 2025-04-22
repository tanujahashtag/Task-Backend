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
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    status: { type: String, required: true, default: "Not Started" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", TaskSchema);
