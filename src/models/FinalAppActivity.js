const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const finalAppActivitySchema = new mongoose.Schema({
  appName: String,
  userID: { type: Schema.Types.ObjectId, required: true, ref: "User" },
  title: String,
  duration: Number,
});

module.exports = mongoose.model("FinalAppActivity", finalAppActivitySchema);
