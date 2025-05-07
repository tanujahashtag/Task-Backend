const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    shortDescription: { type: String },
    additionalInfo: { type: String },

    projectManager: { type: String },
    projectManagerId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

    teams: [
      {
        teamID: { type: String },
        teamName: { type: String },
        members: [
          {
            userId: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            role: { type: String },
            name: { type: String },
          },
        ],
      },
    ],

    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);
module.exports = mongoose.model("Project", projectSchema);
