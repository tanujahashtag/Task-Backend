const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");
const authenticateToken = require("../middlewares/authMiddleware");

// Route setup
router.get("/tasks", authenticateToken, TaskController.allTask);
router.post("/tasks", TaskController.saveTask);
router.get("/tasks/:id", TaskController.getTask);
router.delete("/tasks/:id", TaskController.deleteTask);
router.put("/tasks/:id", TaskController.updateStatus);
router.get("/tasks-count", TaskController.taskCount);

module.exports = router;
