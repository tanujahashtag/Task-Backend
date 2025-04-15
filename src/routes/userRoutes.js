const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const authenticateToken = require("../middlewares/authMiddleware");

// Register user
router.post("/register", UserController.addUser);
router.post("/login", UserController.login);
router.get("/users", authenticateToken, UserController.getAllUsers);
router.put("/users/:id", authenticateToken, UserController.updateUser);

module.exports = router;
