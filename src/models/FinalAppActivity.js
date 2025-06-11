const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const finalAppActivitySchema = new mongoose.Schema({
  activity: [
    {
      appName: String,
      title: String,
      duration: Number,
    },
  ],
  userID: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("FinalAppActivity", finalAppActivitySchema);
