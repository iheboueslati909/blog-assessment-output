"use strict";

const mongoose = require("mongoose");
const Comment = require("../models/comment.js");
const Article = require("../models/article.js");
const eventBus = require('../eventBus');

async function createComment(req, res, next) {
  try {
    const { content, authorId, parentCommentId } = req.body;
    const { articleId } = req.params;

    // basic validation
    if (!content || typeof content !== 'string' || !content.trim()) {
      return res.status(400).json({ error: 'Content is required' });
    }

    // authorId: prefer req.user.id if authenticated
    const finalAuthorId = req.user && req.user.id ? req.user.id : authorId;
    if (!finalAuthorId || !mongoose.Types.ObjectId.isValid(finalAuthorId)) {
      return res.status(400).json({ error: 'Valid authorId is required' });
    }

    if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ error: 'Valid articleId is required' });
    }

    // ensure article exists
    const article = await Article.findById(articleId);
    if (!article) {
      return res.status(404).json({ error: 'Article not found' });
    }

    let parent = null;
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return res.status(400).json({ error: 'Invalid parentCommentId' });
      }
      parent = await Comment.findById(parentCommentId);
      if (!parent) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }
      // optional: ensure parent belongs to same article
      if (parent.articleId.toString() !== articleId.toString()) {
        return res.status(400).json({ error: 'Parent comment does not belong to the same article' });
      }
    }

    const comment = await Comment.create({
      content: content.trim(),
      authorId: finalAuthorId,
      articleId,
      parentCommentId: parent ? parent._id : null,
    });

    // Publish event to event bus
    try {
      await eventBus.publish('comment.created', {
        commentId: comment._id.toString(),
        articleId: comment.articleId.toString(),
        articleAuthorId: article.authorId ? article.authorId.toString() : null,
        content: comment.content,
        authorId: comment.authorId.toString(),
        parentCommentId: comment.parentCommentId ? comment.parentCommentId.toString() : null,
        createdAt: comment.createdAt,
      });
    } catch (evErr) {
      console.error('Failed to publish comment.created event', evErr);
    }

    // Return the saved comment
    res.status(201).json(comment);
  } catch (err) {
    next(err);
  }
}

// Fetch comments for a given article
async function getComments(req, res, next) {
  try {
    const { parentCommentId, page = 1, limit = 20 } = req.query;
    const { articleId } = req.params;

    if (!articleId || !mongoose.Types.ObjectId.isValid(articleId)) {
      return res.status(400).json({ error: 'Valid articleId is required' });
    }

    const p = Math.max(1, parseInt(page, 10) || 1);
    const l = Math.max(1, Math.min(100, parseInt(limit, 10) || 20));

    // If a specific parentCommentId is requested, return that thread (parent + its descendants)
    if (parentCommentId) {
      if (!mongoose.Types.ObjectId.isValid(parentCommentId)) {
        return res.status(400).json({ error: 'Invalid parentCommentId' });
      }

      // Fetch the requested parent comment to ensure it exists and belongs to the article
      const parent = await Comment.findOne({ _id: parentCommentId, articleId });
      if (!parent) {
        return res.status(404).json({ error: 'Parent comment not found' });
      }

      // Fetch all comments for this article and build tree, then return subtree under parent
      const allComments = await Comment.find({ articleId }).sort({ createdAt: -1 });
      const tree = buildCommentTree(allComments);
      // Find the node that matches parentCommentId
      const findNode = (nodes, id) => {
        for (const n of nodes) {
          if (n._id.toString() === id.toString()) return n;
          const found = findNode(n.replies || [], id);
          if (found) return found;
        }
        return null;
      };

      const subtree = findNode(tree, parentCommentId);
      if (!subtree) {
        // Shouldn't happen but be safe
        return res.json([]);
      }

      return res.json(subtree);
    }

    // Default: return paginated top-level comments with nested replies
    // Fetch all comments for the article once (efficient for building tree)
    const allComments = await Comment.find({ articleId }).sort({ createdAt: -1 });
    const tree = buildCommentTree(allComments);

    // Paginate top-level comments
    const start = (p - 1) * l;
    const paginatedTop = tree.slice(start, start + l);

    res.json({
      page: p,
      limit: l,
      totalTopLevel: tree.length,
      comments: paginatedTop,
    });
  } catch (err) {
    next(err);
  }
}

// Helper: build a nested tree of comments from flat array
function buildCommentTree(comments) {
  // Map by id
  const map = new Map();
  const roots = [];

  // Convert docs to plain objects and prepare replies array
  for (const c of comments) {
    const obj = c.toObject ? c.toObject() : { ...c };
    obj.replies = [];
    map.set(obj._id.toString(), obj);
  }

  for (const obj of map.values()) {
    if (obj.parentCommentId) {
      const parent = map.get(obj.parentCommentId.toString());
      if (parent) {
        parent.replies.push(obj);
      } else {
        // parent not found (maybe deleted) -> treat as root
        roots.push(obj);
      }
    } else {
      roots.push(obj);
    }
  }

  // sort replies by createdAt descending (keep same as original)
  const sortRec = (nodes) => {
    nodes.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    for (const n of nodes) {
      if (n.replies && n.replies.length) sortRec(n.replies);
    }
  };
  sortRec(roots);

  return roots;
}

module.exports = {
  createComment,
  getComments,
};
