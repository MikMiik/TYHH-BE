const { match } = require("path-to-regexp");
const publicPaths = [
  { path: "/", method: "get", exact: true },
  { path: "/auth", method: "all", startsWith: true },
  { path: "/cities", method: "get" },
  { path: "/cities/:id", method: "get", pattern: true },
  { path: "/courses", method: "get" },
  { path: "/courses/:id", method: "get", pattern: true },
  { path: "/topics", method: "get" },
  { path: "/schedules", method: "get" },
  { path: "/documents", method: "get" },
  { path: "/documents/:slug", method: "get", pattern: true },
  { path: "/livestreams", method: "get" },
  { path: "/livestreams/:slug", method: "get", pattern: true },
  { path: "/imagekit/auth", method: "get", exact: true },
  { path: "/siteinfo", method: "get" },
  { path: "/socials", method: "get" },
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
