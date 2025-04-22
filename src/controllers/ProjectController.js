const Project = require("../models/Project");
const Task = require("../models/Task");

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
    const projects = await Project.find();
    res.status(200).json(projects);
  } catch (error) {
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
    const projects = await Project.find().select("_id projectName");
    res.status(200).json({ projects });
  } catch (error) {
    console.error(error);
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
          _id: "$project.name",
          number_of_task: { $sum: 1 },
        },
      },

      // Format the output fields
      {
        $project: {
          _id: 0,
          project_name: "$_id",
          number_of_task: 1,
        },
      },
    ]);

    res.status(200).json({ project: results });
  } catch (error) {
    next(error);
  }
};
