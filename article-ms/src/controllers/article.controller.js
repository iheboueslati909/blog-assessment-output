'use strict';

const Article = require("../models/article.js");
const { canUpdateArticle, canDeleteArticle } = require("../middlewares/permissions.middleware.js");
const storageProvider = require("../services/storage/storage.js");
const mongoose = require('mongoose');
const eventBus = require('../eventBus');

//Un utilisateur peut créer un article
async function createArticle(req, res, next) {
  try {
    const imageUrl = req.file ? storageProvider.getFilePath(req.file) : null;
    
    let tags = [];
    
    if (req.body.tags) {
      if (Array.isArray(req.body.tags)) {
        tags = req.body.tags;
      } else if (typeof req.body.tags === 'string') {
        tags = req.body.tags.split(',').map(tag => tag.trim()).filter(tag => tag);
      }
    }

    const article = await Article.create({
      title: req.body.title,
      content: req.body.content,
      image: imageUrl,
      tags: tags,
      authorId: req.user.id,
    });

    res.status(201).json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

async function getArticles(req, res, next) {
  try {
    const { tag, author, page = 1, limit = 10 } = req.query;
    const query = {};
    if (tag) query.tags = tag;
    if (author) query.authorId = author;

    const articles = await Article.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    res.json(articles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getArticle(req, res, next) {
  try {
    const id = req.params.id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(404).json({
        error: "Invalid article ID format",
        message: "not found/Wrong id format"
      });
    }

    const article = await Article.findById(id);

    if (!article) {
      return res.status(404).json({
        error: "Article not found",
        message: `No article found with ID: ${id}`
      });
    }

    res.json(article);
  } catch (err) {
    console.error('Error fetching article:', err);
    res.status(500).json({
      error: "Internal server error",
      message: err.message
    });
  }
}

//Un Éditeur ou un Admin peut modifier n’importe quel article.
//Un Rédacteur peut uniquement modifier ses propres articles.
async function updateArticle(req, res, next) {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Not found" });

    if (!canUpdateArticle(req.user, article)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    Object.assign(article, req.body);
    await article.save();
    res.json(article);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

//Seul un Admin peut supprimer des articles.
async function deleteArticle(req, res, next) {
  try {
    const article = await Article.findById(req.params.id);
    if (!article) return res.status(404).json({ error: "Not found" });

    if (!canDeleteArticle(req.user)) {
      return res.status(403).json({ error: "Forbidden" });
    }

    await article.deleteOne();
    res.json({ message: "Article deleted" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  deleteArticle,
  updateArticle,
  getArticle,
  getArticles,
  createArticle
};