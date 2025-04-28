const Project = require("../models/Project");
const Task = require("../models/Task");
const User = require("../models/User");
const jwt = require("jsonwebtoken");
// Add new project
exports.addProject = async (req, res) => {
  try {
    const {
      projectName,
      shortDescription,
      additionalInfo,
      startDate,
      endDate,
    } = req.body;
    const newProject = new Project({
      projectName,
      shortDescription,
      additionalInfo,
      startDate,
      endDate,
    });

    await newProject.save();
    res
      .status(201)
      .json({ message: "Project created successfully", project: newProject });
  } catch (error) {
    res.status(500).json({ message: "Error creating project", error });
  }
};

// Update existing project
exports.updateProject = async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;

    const updatedProject = await Project.findByIdAndUpdate(id, updates, {
      new: true,
    });

    if (!updatedProject)
      return res.status(404).json({ message: "Project not found" });

    res
      .status(200)
      .json({ message: "Project updated", project: updatedProject });
  } catch (error) {
    res.status(500).json({ message: "Error updating project", error });
  }
};

// Get all projects
exports.allProject = async (req, res) => {
  try {
    const { id: user_id } = req.params;
    // Step 1: Find the user's role based on user_id
    const user = await User.findById(user_id);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.role.toLowerCase(); // Get the role of the user

    // Step 2: Fetch all projects
    const projects = await Project.find(); // Get all projects

    const projectsWithTasks = await Promise.all(
      projects.map(async (project) => {
        // Fetch tasks associated with the project
        const tasks = await Task.find({ project_id: project._id }).populate(
          "user_id"
        );

        // Filter tasks based on user role
        const filteredTasks = tasks
          .filter((task) => {
            if (!task.user_id) return false; // Ensure the user exists

            // If the user is admin or project manager, show all tasks
            if (role === "admin" || role === "project manager") {
              return true;
            }

            // For other roles, only show tasks that are assigned to this user
            return task.user_id._id.toString() === user_id;
          })
          .map((task) => ({
            task_name: task.task_name,
            description: task.description,
            assigned_to: task.assigned_to,
            due_date: task.due_date,
            status: task.status,
            createdAt: task.createdAt,
            updatedAt: task.updatedAt,
            _id: task._id,
          }));

        // If the user is assigned any tasks, include the project
        if (filteredTasks.length > 0) {
          return {
            ...project.toObject(),
            tasks: filteredTasks,
          };
        }
        return null; // Return null if the user has no tasks in this project
      })
    );

    // Filter out any null projects (where no tasks were found for the user)
    const filteredProjects = projectsWithTasks.filter(
      (project) => project !== null
    );

    return res.status(200).json({ projects: filteredProjects });
  } catch (error) {
    console.error("Error:", error.message || error);
    res.status(500).json({ message: "Error fetching projects", error });
  }
};

// Get single project
exports.getProject = async (req, res) => {
  try {
    const { id } = req.params;
    const project = await Project.findById(id);

    if (!project) return res.status(404).json({ message: "Project not found" });

    res.status(200).json(project);
  } catch (error) {
    res.status(500).json({ message: "Error fetching project", error });
  }
};

// Delete project
exports.deleteProject = async (req, res) => {
  try {
    const { id } = req.params;
    const deletedProject = await Project.findByIdAndDelete(id);

    if (!deletedProject)
      return res.status(404).json({ message: "Project not found" });

    res.status(200).json({ message: "Project deleted" });
  } catch (error) {
    res.status(500).json({ message: "Error deleting project", error });
  }
};

exports.getProjectList = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const role = user.role.toLowerCase(); // Get the role of the user

    let projects;

    // Fetch all projects if the user is an Admin or Project Manager
    if (role === "admin" || role === "project manager") {
      projects = await Project.find().select("_id projectName");
    } else {
      // For other roles, find only the projects the user is assigned to
      const tasks = await Task.find({ user_id: user.userId }).select(
        "project_id"
      );

      const projectIds = tasks.map((task) => task.project_id); // Get the list of project IDs the user is assigned to

      projects = await Project.find({ _id: { $in: projectIds } }).select(
        "_id projectName"
      ); // Fetch only those projects
    }

    res.status(200).json({ projects });
  } catch (error) {
    console.error("Error fetching projects:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.getProjectTaskCount = async (req, res) => {
  try {
    const results = await Task.aggregate([
      // Join with projects to get project name
      {
        $lookup: {
          from: "projects",
          localField: "project_id",
          foreignField: "_id",
          as: "project",
        },
      },
      { $unwind: "$project" },

      // Group by project name and count tasks

      {
        $group: {
          _id: "$project.projectName",
          number_of_task: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          project_name: "$_id",
          number_of_task: 1,
        },
      },
    ]);

    res.status(200).json({ projects: results });
  } catch (error) {
    next(error);
  }
};
