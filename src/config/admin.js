require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const User = require("../models/User");

exports.run = async function () {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log("Connected to MongoDB");

    const existingAdmin = await User.findOne({
      email: "admin@hashtagtechno.com",
    });
    if (existingAdmin) {
      console.log("Admin already exists.");
      return;
    }

    const hashedPassword = await bcrypt.hash("Admin@123", 10);

    const adminUser = new User({
      name: "Admin",
      email: "admin@hashtagtechno.com",
      password: hashedPassword,
      designation: "Admin",
    });

    const result = await adminUser.save();
    console.log("Inserted admin with ID:", result._id);
  } catch (err) {
    console.error("Error inserting admin:", err);
  } finally {
    await mongoose.connection.close();
    console.log("MongoDB connection closed.");
  }
};
