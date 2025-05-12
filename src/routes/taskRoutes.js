const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");
const authenticateToken = require("../middlewares/authMiddleware");

// Route setup
router.get("/get-all", authenticateToken, TaskController.allTask);
router.post("/add", TaskController.saveTask);
router.get("/get/:id", TaskController.getTask);
router.delete("/delete/:id", TaskController.deleteTask);
router.put("/update-status/:id", TaskController.updateStatus);
router.put("/update/:id", TaskController.updateTask);
router.get("/tasks-count", TaskController.taskCount);

module.exports = router;
