'use strict';

function canUpdateRoles(user) {
  return user?.roles?.includes("Admin") || false;
}

function canListUsers(user) {
  return user?.roles?.includes("Admin") || false;
}

module.exports = {
  canUpdateRoles,
  canListUsers
};
