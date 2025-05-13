const express = require("express");
const router = express.Router();
const Timercontroller = require("../controllers/TimerController");

router.post("/start", Timercontroller.startTimer);
router.post("/pause", Timercontroller.pauseTimer);
router.post("/resume", Timercontroller.resumeTimer);
router.post("/stop", Timercontroller.stopTimer);
router.get("/productivity", Timercontroller.getProductivity);

module.exports = router;
