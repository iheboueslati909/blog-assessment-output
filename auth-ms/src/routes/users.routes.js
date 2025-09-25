// src/api/routes/users.routes.js
const express = require('express');
const router = express.Router();
const UsersController = require('../controllers/users.controller');
const { authenticate } = require('../middleware/auth.middleware');

router.get('/me', authenticate, UsersController.getMe);
router.put('/:id/roles', authenticate, UsersController.updateUserRoles);
router.get('/', authenticate, UsersController.listUsers);

module.exports = router;
