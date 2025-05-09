const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");

const userRoutes = require("./src/routes/userRoutes");
const taskRoutes = require("./src/routes/taskRoutes");
const projectRoutes = require("./src/routes/projectRoutes");
const roleRoutes = require("./src/routes/roleRoutes");
const teamRoutes = require("./src/routes/teamRoutes");

dotenv.config();
const app = express();

app.use(express.json());
app.use(cors());

// Define routes
app.use("/auth", userRoutes);
app.use("/tasks", taskRoutes);
app.use("/projects", projectRoutes);
app.use("/roles", roleRoutes);
app.use("/teams", teamRoutes);
app.use(
  "/profile-images",
  express.static(path.join(__dirname, "src/uploads/profileImages"))
);

const PORT = process.env.PORT || 5000;

// MongoDB connection
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected");
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch((err) => console.log("MongoDB Connection Error:", err));
