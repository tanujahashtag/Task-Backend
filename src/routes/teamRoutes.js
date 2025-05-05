const express = require("express");
const router = express.Router();
const TeamController = require("../controllers/TeamController");
// Const authenticateToken = require("../middlewares/authMiddleware");

// Route setup
router.post("/add", TeamController.createTeam);
router.get("/get-all", TeamController.getAllTeams);
router.get("/get/:id", TeamController.getTeamById);
router.put("/update/:id", TeamController.updateTeam);
router.delete("/delete/:id", TeamController.deleteTeam);
router.get("/team-leads-list", TeamController.teamLeadList);
router.get("/team-user-list", TeamController.teamLeadList);

module.exports = router;
