const { createNamespace } = require("cls-hooked");
const session = createNamespace("my session");

const setContext = (req, res, next) => {
  session.run(() => {
    if (req.userId) {
      session.set("userId", req.userId);
    }
    next();
  });
};

module.exports = { setContext, session };
