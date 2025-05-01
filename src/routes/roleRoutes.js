const express = require('express');
const router = express.Router();
const RoleController = require('../controllers/RoleController');

// Define Routes
router.post('/add', RoleController.createRole);
router.get('/get-all', RoleController.getAllRoles);
router.get('/get/:id', RoleController.getRoleById);
router.put('/update/:id', RoleController.updateRole);
router.delete('/delete/:id', RoleController.deleteRole);

module.exports = router;
