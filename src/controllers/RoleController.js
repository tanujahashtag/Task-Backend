const Role = require("../models/Role");

// Create a Role
exports.createRole = async (req, res) => {
  try {
    const { name, route } = req.body;
    const role = new Role({ name, route });
    await role.save();
    res.status(201).json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all Roles
exports.getAllRoles = async (req, res) => {
  try {
    const roles = await Role.find();
    res.json(roles);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get single Role by ID
exports.getRoleById = async (req, res) => {
  try {
    const role = await Role.findById(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a Role
exports.updateRole = async (req, res) => {
  try {
    const { name, route } = req.body;
    const role = await Role.findByIdAndUpdate(
      req.params.id,
      { name, route },
      { new: true, runValidators: true }
    );
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json(role);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a Role
exports.deleteRole = async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id);
    if (!role) return res.status(404).json({ error: "Role not found" });
    res.json({ message: "Role deleted" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
