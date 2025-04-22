const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");

// Route setup
router.get("/tasks", TaskController.allTask);
router.post("/tasks", TaskController.saveTask);
router.get("/tasks/:id", TaskController.getTask);
router.delete("/tasks/:id", TaskController.deleteTask);
router.put("/tasks/:id", TaskController.updateStatus);
router.get("/tasks-count", TaskController.taskCount);

module.exports = router;
