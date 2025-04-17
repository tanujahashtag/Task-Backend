const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/ProjectController");
const authenticateToken = require("../middlewares/authMiddleware");

router.post("/projects", ProjectController.addProject);
router.put("/projects", ProjectController.updateProject);
router.get("/projects", ProjectController.allProject);
router.get("/projects/:id", ProjectController.getProject);
router.delete("/projects", ProjectController.deleteProject);
router.get("/project-list", ProjectController.getProjectList);

module.exports = router;
