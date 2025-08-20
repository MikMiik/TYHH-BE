const response = require("@/utils/response");
const paginationConfig = require("@/configs/pagination");

function handlePagination(req, res, next) {
  const { defaultPage, defaultLimit, maxLimit } = paginationConfig;

  const page = +req.query.page > 0 ? +req.query.page : defaultPage;
  let limit = +req.query.limit > 0 ? +req.query.limit : defaultLimit;

  if (limit > maxLimit) limit = maxLimit;

  req.page = page;
  req.limit = limit;

  res.paginate = ({ items, total }) => {
    response.paginate(res, items, total, page, limit);
  };

  next();
}

module.exports = handlePagination;
