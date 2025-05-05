const mongoose = require("mongoose");

const TeamSchema = new mongoose.Schema(
  {
    teamName: { type: String, required: true, unique: true },
    teamLead: { type: String, required: true },
    teamLeadId: { type: String, required: true },
    teamMember: [
      {
        userId: { type: String, required: true },
        role: { type: String, required: true },
        name: { type: String, required: true },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Team", TeamSchema);
