const User = require("../models/User");
const Project = require("../models/Project");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

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

    const generateUsername = (name) => {
      const baseName = name.replace(/\s+/g, "").toLowerCase();
      const randomNumber = Math.floor(10 + Math.random() * 90);
      return `${baseName}${randomNumber}`;
    };

    const username = generateUsername(name);
    // Create a new user
    const newUser = new User({
      name,
      email,
      password,
      username,
      role: role || "Employee",
      project: project || null,
      designation: designation || null,
    });

    await newUser.save();

    res.status(201).json({
      message: "User registered successfully",
      user: {
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        username: newUser.username,
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

    // Compare the hashed password with the entered password

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    const profileImageUrl = user.profileImage
      ? `${req.protocol}://${req.get("host")}/uploads/${user.profileImage}`
      : `${req.protocol}://${req.get("host")}/uploads/default-avatar.png`;

    // Generate a JWT token
     

    res.status(200).json({
      message: "Login successful",
      token: token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        profileImage: profileImageUrl,
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

    const usersWithProfileImage = users.map((user) => {
      const profileImageUrl = user.profileImage
        ? `${req.protocol}://${req.get("host")}/uploads/${user.profileImage}`
        : `${req.protocol}://${req.get("host")}/uploads/default-avatar.png`;

      return {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        project: user.project,
        profileImage: profileImageUrl,
      };
    });

    res.status(200).json({ users: usersWithProfileImage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile
exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const user = await User.findById(id);
    const loggedInUserRole = user.role;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // Disallowed fields for non-admin users
    const restrictedFields = ["email", "role", "project"];
    if (loggedInUserRole !== "Admin") {
      for (let field of restrictedFields) {
        if (field in updates) {
          return res.status(403).json({
            message: `You are not authorized to update '${field}'.`,
          });
        }
      }
    }

    // Handle password hashing if provided
    if (updates.password) {
      updates.password = await bcrypt.hash(updates.password, 10);
    }

    // Prevent email update regardless of role
    delete updates.email;

    // Apply updates
    Object.keys(updates).forEach((key) => {
      user[key] = updates[key];
    });

    const profileImageUrl = user.profileImage
      ? `${req.protocol}://${req.get("host")}/uploads/${user.profileImage}`
      : `${req.protocol}://${req.get("host")}/uploads/default-avatar.png`;

    //await user.save();

    res.status(200).json({
      message: "User updated successfully",
      user: {
        name: user.name,
        email: user.email, // Email remains unchanged
        role: user.role,
        project: user.project,
        profileImage: profileImageUrl,
      },
    });
  } catch (error) {
    res.status(500).json({
      message: "Server error",
      error: error.message || error.toString(),
    });
  }
};

exports.getUserList = async (req, res) => {
  try {
    const { id: project_id } = req.params;
    if (!project_id) {
      return res.status(400).json({ message: "Project ID is required" });
    }

    // Step 2: Find all users who are associated with the given project
    const users = await User.find({
      role: { $ne: "Admin" }, // Exclude Admins
      "project.project_id": project_id, // Find users who are assigned to the given project_id
    }).select("_id name role"); // Only return _id, name, and role fields

    // Step 3: Return the list of users
    res.status(200).json({ users });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
};

// Multer Configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "src/uploads/profileImage");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage });

// Upload Profile
exports.uploadProfile = async (req, res) => {
  upload.single("profileImage")(req, res, async (err) => {
    try {
      if (err) {
        return res
          .status(400)
          .json({ message: "File upload failed", error: err.message });
      }

      if (!req.file) {
        return res.status(400).json({ message: "No file provided" });
      }
      console.log("data", req.body);
      const userId = req.body.id;
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old profile image if not default
      if (user.profileImage && user.profileImage !== "default-avatar.png") {
        const oldImagePath = path.join(
          __dirname,
          "../uploads/profileImage",
          user.profileImage
        );
        if (fs.existsSync(oldImagePath)) {
          fs.unlinkSync(oldImagePath);
        }
      }

      // Update user profileImage
      user.profileImage = req.file.filename;
      await user.save();

      res.status(200).json({
        message: "Profile image uploaded and user updated successfully",
        filename: req.file.filename,
      });
    } catch (error) {
      console.error("Upload error:", error);
      res.status(500).json({ message: "Server error", error: error.message });
    }
  });
};

exports.userDetail = async (req, res) => {
  try {
    const { id } = req.params;

    // Fetch the user by ID
    const user = await User.findById(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    let userProjects = [];
    if (user.project && user.project.length > 0) {
      const projectIds = user.project.map((p) => p.project_id);
      const projects = await Project.find({ _id: { $in: projectIds } }).select(
        "_id projectName"
      );

      // match the _id with user.project and return only id + name
      userProjects = projects.map((proj) => ({
        project_id: proj._id,
        projectName: proj.projectName,
      }));
    }

    // Construct full URL for profile image if it exists
    const profileImageUrl = user.profileImage
      ? `${req.protocol}://${req.get("host")}/uploads/${user.profileImage}`
      : `${req.protocol}://${req.get("host")}/uploads/default-avatar.png`;

    // Return user details
    res.status(200).json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      project: userProjects, // Only id + name
      profileImage: profileImageUrl,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({ message: "Server error" });
  }
};
