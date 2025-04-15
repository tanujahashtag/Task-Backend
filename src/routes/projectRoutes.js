const express = require("express");
const router = express.Router();
const ProjectController = require("../controllers/ProjectController");
const authenticateToken = require("../middlewares/authMiddleware");

router.post("/projects", authenticateToken, ProjectController.addProject);
router.put("/projects", authenticateToken, ProjectController.updateProject);
router.get("/projects", authenticateToken, ProjectController.allProject);
router.get("/projects/:id", authenticateToken, ProjectController.getProject);
router.delete("/projects", authenticateToken, ProjectController.deleteProject);

module.exports = router;
