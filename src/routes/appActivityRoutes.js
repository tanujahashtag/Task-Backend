const express = require("express");
const router = express.Router();
const AppActivityController = require("../controllers/AppActivityController");

router.post("/save", AppActivityController.addActivity);
router.get("/get/:userID", AppActivityController.getActivity);

module.exports = router;
