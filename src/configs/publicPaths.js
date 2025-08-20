const { match } = require("path-to-regexp");
const publicPaths = [
  { path: "/", method: "get", exact: true },
  { path: "/about", method: "get", startsWith: true },
  { path: "/contact", method: "get", startsWith: true },
  { path: "/auth", method: "all", startsWith: true },
  { path: "/posts", method: "get", exact: true },
  { path: "/posts/search", method: "get", startsWith: true },
  { path: "/posts/:id", method: "get", pattern: true, startsWith: true },
  { path: "/topics", method: "get", startsWith: true },
  { path: "/profiles", method: "get", exact: true },
  { path: "/profiles/:id", method: "get", startsWith: true, pattern: true },
  { path: "/uploads", method: "get", startsWith: true },
  { path: "/chat", method: "all", startsWith: true },
];

function isPublicRoute(path, method) {
  const normalizedMethod = method.toLowerCase();
  return publicPaths.some((rule) => {
    const fullPath = rule.path;
    const methodMatch =
      rule.method === "all" || rule.method === normalizedMethod;

    if (!methodMatch) return false;
    if (rule.exact) return path === fullPath;
    if (rule.pattern) {
      const matcher = match(fullPath, { decode: decodeURIComponent });
      return matcher(path) !== false;
    }
    if (rule.startsWith) return path.startsWith(fullPath);

    return false;
  });
}

module.exports = isPublicRoute;
