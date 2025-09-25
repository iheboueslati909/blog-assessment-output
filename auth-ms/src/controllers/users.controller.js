'use strict';

const { canListUsers, canUpdateRoles } = require('../middleware/permissions.middleware');
const UserModel = require('../models/user.model');

async function getMe(req, res, next) {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const user = await UserModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const safe = typeof user.toSafeObject === 'function' ? user.toSafeObject() : user.toObject();
    return res.status(200).json({ user: safe });
  } catch (err) {
    return next(err);
  }
}

/**
 * PATCH /users/:id/roles
 * Admin only – update roles of a user
 */
async function updateUserRoles(req, res, next) {
  try {

    if (!canUpdateRoles(req.user)) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const { id } = req.params;
    const { roles } = req.body;

    if (!Array.isArray(roles) || roles.length === 0) {
      return res.status(400).json({ message: 'Roles must be a non-empty array' });
    }

    const validRoles = ['Admin', 'Editor', 'Author'];
    const invalid = roles.filter(r => !validRoles.includes(r));
    if (invalid.length > 0) {
      return res.status(400).json({ message: `Invalid roles: ${invalid.join(', ')}` });
    }

    const user = await UserModel.findByIdAndUpdate(
      id,
      { roles },
      { new: true, runValidators: true }
    );

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    return res.status(200).json({ user: user.toSafeObject() });
  } catch (err) {
    return next(err);
  }
}

/**
 * GET /users
 * Admin only – list users with pagination
 */
async function listUsers(req, res, next) {
  try {
    if (!canListUsers(req.user)) {
      return res.status(403).json({ error: "Forbidden: Admin access required" });
    }

    const page = Math.max(1, parseInt(req.query.page, 10) || 1);
    const limit = Math.min(100, parseInt(req.query.limit, 10) || 20);
    const skip = (page - 1) * limit;

    const [users, total] = await Promise.all([
      UserModel.find({}, 'name email roles')
        .skip(skip)
        .limit(limit)
        .lean(),
      UserModel.countDocuments(),
    ]);

    return res.status(200).json({
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
      users,
    });
  } catch (err) {
    return next(err);
  }
}

module.exports = {
  getMe,
  updateUserRoles,
  listUsers,
};
