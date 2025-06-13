const express = require("express");
const router = express.Router();
const AppActivityController = require("../controllers/AppActivityController");

router.post("/save", AppActivityController.addActivity);
router.get("/get/:userID", AppActivityController.getActivity);
router.post("/ideal-time", AppActivityController.idealTime);

module.exports = router;
