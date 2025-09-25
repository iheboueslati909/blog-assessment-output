'use strict';
const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/auth.middleware.js');
const storageProvider = require('../services/storage/storage.js'); // local or s3

const {
  createArticle,
  getArticles,
  getArticle,
  updateArticle,
  deleteArticle,
} = require('../controllers/article.controller.js');

const { createComment, getComments } = require('../controllers/comment.controller');

// Articles
router.get('/', authMiddleware.authenticate, getArticles);
router.get('/:id', getArticle);

router.post(
  '/',
  authMiddleware.authenticate,
  storageProvider.upload.single('image'),
  createArticle
);

router.put(
  '/:id',
  authMiddleware.authenticate,
  storageProvider.upload.single('image'),
  updateArticle
);

router.delete('/:id', authMiddleware.authenticate, deleteArticle);

router.post('/:articleId/comments', authMiddleware.authenticate, createComment);
router.get('/:articleId/comments', getComments);

module.exports = router;
