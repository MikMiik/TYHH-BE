const { Op } = require("sequelize");

/**
 * Simple service options helper
 */
function getServiceConfig(isAdmin = false) {
  return {
    isAdmin,
    excludeFields: isAdmin ? [] : ["password", "key", "activeKey"],
    allowInactive: isAdmin,
  };
}

function buildAttributes(isAdmin = false) {
  if (isAdmin) return undefined;
  return { exclude: ["password", "key", "activeKey"] };
}

function buildWhereConditions(isAdmin = false, additionalWhere = {}) {
  let where = { ...additionalWhere };
  if (!isAdmin) {
    where.status = { [Op.ne]: "inactive" };
  }
  return where;
}

module.exports = {
  getServiceConfig,
  buildAttributes,
  buildWhereConditions,
};
