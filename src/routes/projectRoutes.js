const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/ProjectController");
const authenticateToken = require("../middlewares/authMiddleware");

router.post("/add", ProjectController.addProject);
router.put("/update", ProjectController.updateProject);
router.get("/get/:id", ProjectController.getProject);
router.delete("/delete", ProjectController.deleteProject);
router.get("/projects-task-list/:id", ProjectController.allProject);
router.get("/project-list",authenticateToken,ProjectController.getProjectList);
router.get("/project-name", ProjectController.getProjecName);
router.get("/project-task-count", ProjectController.getProjectTaskCount);

module.exports = router;
