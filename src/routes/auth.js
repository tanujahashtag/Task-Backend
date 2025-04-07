const express = require("express");
const router = express.Router();
const TaskController = require("../controllers/TaskController");

// Route setup
router.get("/tasks", TaskController.allTask);
router.post("/tasks", TaskController.saveTask);
router.get("/tasks/:id", TaskController.getTask);
router.delete("/tasks/:id", TaskController.deleteTask);

module.exports = router;
