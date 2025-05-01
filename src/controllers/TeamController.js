const User = require("../models/Team");

// Register user
exports.addTeam = async (req, res) => {
  try {
    const { teamName, teamLead, teamLeadId, teamMember } = req.body;

    const newTeam = new Team({
      teamName,
      teamLead,
      teamLeadId,
      teamMember,
    });

    await newTeam.save();

    res
      .status(201)
      .json({ message: "Team created successfully", team: newTeam });
  } catch (error) {
    res.status(500).json({ message: "Error creating team", error });
  }
};

// Get All Teams
exports.getAllTeams = async (req, res) => {
  try {
    const teams = await Team.find();
    res.status(200).json(teams);
  } catch (error) {
    res.status(500).json({ message: "Error fetching teams", error });
  }
};

// Get Single Team by ID
exports.getTeamById = async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) return res.status(404).json({ message: "Team not found" });

    res.status(200).json(team);
  } catch (error) {
    res.status(500).json({ message: "Error fetching team", error });
  }
};

// Update Team
exports.updateTeam = async (req, res) => {
  try {
    const updatedTeam = await Team.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
    });

    if (!updatedTeam)
      return res.status(404).json({ message: "Team not found" });

    res.status(200).json({ message: "Team updated", team: updatedTeam });
  } catch (error) {
    res.status(500).json({ message: "Error updating team", error });
  }
};

// Delete Team
exports.deleteTeam = async (req, res) => {
  try {
    const deleted = await Team.findByIdAndDelete(req.params.id);

    if (!deleted) return res.status(404).json({ message: "Team not found" });

    res.status(200).json({ message: "Team deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting team", error });
  }
};
