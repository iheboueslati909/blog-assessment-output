// src/api/routes/auth.routes.js
'use strict';

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/auth.controller');

router.post('/login', AuthController.login);
router.post('/refresh', AuthController.refresh);
router.post('/logout', AuthController.logout);
router.post('/register', AuthController.register);

module.exports = router;
