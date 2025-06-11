const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const tempAppActivitySchema = new mongoose.Schema(
  {
    appName: { type: String },
    title: { type: String },
    userID: { type: Schema.Types.ObjectId, required: true, ref: "User" },
    openedAt: { type: Date, default: Date.now },
    closedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("TempAppActivity", tempAppActivitySchema);
