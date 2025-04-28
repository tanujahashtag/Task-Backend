const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');

// Define Routes
router.post('/roles', RoleController.createRole);
router.get('/roles', RoleController.getAllRoles);
router.get('/roles/:id', RoleController.getRoleById);
router.put('/roles/:id', RoleController.updateRole);
router.delete('/roles/:id', RoleController.deleteRole);

module.exports = router;
