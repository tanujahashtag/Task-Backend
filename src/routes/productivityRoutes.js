const express = require("express");
const router = express.Router();
const ProductivityController = require("../controllers/ProductivityController");
const authenticateToken = require("../middlewares/authMiddleware");

router.get("/get", authenticateToken,ProductivityController.getProductivity);

module.exports = router;
