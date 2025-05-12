const Team = require("../models/Team");
const User = require("../models/User");

// Create Team
exports.createTeam = async (req, res) => {
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
    const { id } = req.params; // Team ID from URL
    const { teamName, teamLead, teamLeadId, teamMember } = req.body;

    const updatedTeam = await Team.findByIdAndUpdate(
      id,
      {
        teamName,
        teamLead,
        teamLeadId,
        teamMember,
      },
      { new: true, runValidators: true }
    );

    if (!updatedTeam) {
      return res.status(404).json({ message: "Team not found" });
    }

    res
      .status(200)
      .json({ message: "Team updated successfully", team: updatedTeam });
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

//List of Team Leads
exports.teamLeadList = async (req, res) => {
  try {
    // Get all users who are team leads
    const leads = await User.find({ role: "Team Lead" }); // Adjust role field as per your data
    // For each lead, check if they're part of any team
    const leadWithTeams = await Promise.all(
      leads.map(async (lead) => {
        const team = await Team.findOne({
          $or: [
            { teamLeadId: lead._id.toString() },
            { "teamMember.userId": lead._id.toString() },
          ],
        });

        return {
          _id: lead._id,
          name: lead.name,
          email: lead.email,
          teamName: team ? team.teamName : null,
          teamLeadId: team ? team.teamLeadId : null,
        };
      })
    );

    res.status(200).json({ success: true, data: leadWithTeams });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

//List of Team Members
exports.teamUserList = async (req, res) => {
  try {
    const users = await User.find({ role: "Employee" });
    const usersWithTeams = await Promise.all(
      users.map(async (user) => {
        const userIdStr = user._id.toString();

        const team = await Team.findOne({
          $or: [{ teamLeadId: userIdStr }, { "teamMember.userId": userIdStr }],
        });

        return {
          _id: user._id,
          name: user.name,
          email: user.email,
          teamName: team ? team.teamName : null,
          teamId: team ? team._id : null,
        };
      })
    );

    res.status(200).json({ success: true, data: usersWithTeams });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

exports.teamMemberList = async (req, res) => {
  try {
    const { id } = req.params;

    const team = await Team.findById(id);

    if (!team) {
      return res.status(404).json({ message: "Team not found" });
    }

    res.status(200).json({ members: team.teamMember });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
};
