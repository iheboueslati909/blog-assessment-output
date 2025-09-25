"use strict";

const express = require('express');
const { createComment, getComments } = require('../controllers/comment.controller.js');
const authMiddleware = require('../middlewares/auth.middleware.js');

const router = express.Router();

// Create a new comment (requires authentication)
router.post('/', authMiddleware.authenticate, createComment);

// Get comments for an article (public)
router.get('/', getComments);

module.exports = router;
