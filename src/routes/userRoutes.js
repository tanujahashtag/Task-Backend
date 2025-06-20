const express = require("express");
const router = express.Router();
const UserController = require("../controllers/UserController");
const authenticateToken = require("../middlewares/authMiddleware");

// Register user
router.post("/register", UserController.addUser);
router.post("/login", UserController.login);
router.delete("/logout/:userID", UserController.logOut);
router.get("/get-all", UserController.getAllUsers);
router.get("/users-list/:id", UserController.getUserList);
router.get("/users-detail/:id", UserController.userDetail);
router.put("/update/:id", UserController.updateUser);
router.post("/upload-profile", UserController.uploadProfile);

module.exports = router;
