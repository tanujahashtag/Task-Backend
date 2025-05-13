const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const timerCycleSchema = new Schema({
    task_timer_id: {
        type: Schema.Types.ObjectId,
        ref: "TaskTimer",
        required: true,
    },
    pause_time: { type: Date, required: true },
    resume_time: Date,
    duration: Number,
});
timerCycleSchema.index({ task_timer_id: 1 });

module.exports = mongoose.model("TimerCycle", timerCycleSchema);
