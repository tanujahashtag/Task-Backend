const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const taskTimerSchema = new Schema({
    task_id: { type: Schema.Types.ObjectId, required: true },
    
    user_id: { type: Schema.Types.ObjectId, required: true },
    start_time: { type: Date, required: true },
    end_time: Date,
    duration: { type: Number, default: 0 },
});

taskTimerSchema.index({ user_id: 1, start_time: 1 });
module.exports = mongoose.model("TaskTimer", taskTimerSchema);
