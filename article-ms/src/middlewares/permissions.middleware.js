'use strict';

function canUpdateArticle(user, article) {
  if (!user || !user.roles || !Array.isArray(user.roles)) return false;
  if (user.roles.includes("Admin") || user.roles.includes("Editor")) return true;
  if (user.roles.includes("Writer") && article.authorId.toString() === user.id) return true;
  return false;
}

function canDeleteArticle(user) {
  return user?.roles?.includes("Admin") || false;
}

module.exports = {
  canDeleteArticle,
  canUpdateArticle
};
