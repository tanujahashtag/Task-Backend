const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const finalAppActivitySchema = new mongoose.Schema({
  activity: [
    {
      appName: String,
      title: String,
      duration: Number,
      createdAt: { type: Date, default: Date.now },
      updatedAt: { type: Date, default: Date.now },
    },
  ],
  totalIdleTime: [
    {
      date: { type: Date, default: Date.now }, // Format: YYYY-MM-DD
      seconds: { type: Number, default: 0 },
      readable: { type: String, default: "0h 0m" },
    },
  ],
  userID: { type: Schema.Types.ObjectId, required: true, ref: "User" },
});

module.exports = mongoose.model("FinalAppActivity", finalAppActivitySchema);
