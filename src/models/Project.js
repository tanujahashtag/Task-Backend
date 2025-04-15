const mongoose = require("mongoose");

const projectSchema = new mongoose.Schema(
  {
    projectName: { type: String, required: true },
    shortDescription: { type: String },
    additionalInfo: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Project", projectSchema);
