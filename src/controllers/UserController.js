const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

// Register user
exports.addUser = async (req, res) => {
  try {
    const { name, email, password, role, project, designation } = req.body;
    // Validate required fields
    if (!name || !email || !password) {
      return res
        .status(400)
        .json({ message: "name, email, and password are required" });
    }

    // Check if user already exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }
    const defaultProfileImage = "default-avatar.png";
    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      role: role || "User",
      project: project || null,
      designation: project || null,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        project: newUser.project,
        designation: newUser.designation,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate required fields
    if (!email || !password) {
      return res
        .status(400)
        .json({ message: "Email and password are required" });
    }

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }
    `~`;

    // Compare the hashed password with the entered password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Generate a JWT token
    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      "your_secret_key",
      { expiresIn: "1h" }
    );

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        project: user.project,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get all users
exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "Admin" } });
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, password, role, project } = req.body;

    // Get the logged-in user's role from the decoded JWT (req.user will contain the decoded token)
    const loggedInUserRole = req.user.role;

    // Fetch the user to be updated
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If the logged-in user is not an Admin, restrict their access to role, email, and project updates
    if (loggedInUserRole !== "Admin" && (role || email || project)) {
      return res.status(403).json({
        message: "You are not authorized to update role, email, or project.",
      });
    }

    // If password is provided, hash it
    if (password) {
      user.password = await bcrypt.hash(password, 10); // Hash the new password
    }

    // Update allowed fields
    if (name) user.name = name;
    if (email && loggedInUserRole === "Admin") user.email = email; // Only admins can change email
    if (role && loggedInUserRole === "Admin") user.role = role; // Only admins can change role
    if (project && loggedInUserRole === "Admin") user.project = project; // Only admins can change project

    await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        project: user.project,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getUserList = async (req, res) => {
  try {
    const users = await User.find({ role: { $ne: "Admin" } }).select(
      "_id name"
    );
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};
