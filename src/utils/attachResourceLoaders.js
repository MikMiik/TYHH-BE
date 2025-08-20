const capitalize = require("./capitalize");
const throw404 = require("./throw404");

const services = {
  post: require("@/services/post.service"),
  user: require("@/services/user.service"),
  comment: require("@/services/comment.service"),
};

function attachResourceLoaders(router, params) {
  params.forEach((param) => {
    router.param(param, async (req, res, next, id) => {
      // giá trị của param được truyền vào id của callback
      const resource = await services[param].getById(id);
      if (!resource) throw404(`${capitalize(param)} not found`);
      req[param] = resource;
      next();
    });
  });
}

module.exports = attachResourceLoaders;
