const { match } = require("path-to-regexp");

// Private auth endpoints that require authentication
const privateAuthPaths = [
  "/auth/me",
  "/auth/check-key",
  "/auth/change-password",
  "/auth/change-email",
];

const publicPaths = [
  { path: "/", method: "get", exact: true },
  { path: "/auth/login", method: "post", exact: true },
  { path: "/auth/register", method: "post", exact: true },
  { path: "/auth/logout", method: "post", exact: true },
  { path: "/auth/refresh-token", method: "post", exact: true },
  { path: "/auth/forgot-password", method: "post", exact: true },
  { path: "/auth/reset-password", method: "post", exact: true },
  { path: "/auth/verify-email", method: "get", exact: true },
  { path: "/auth/verify-reset-token", method: "get", exact: true },
  { path: "/auth/google", method: "post", exact: true },
  { path: "/cities", method: "get" },
  { path: "/cities/:id", method: "get", pattern: true },
  { path: "/courses", method: "get" },
  { path: "/courses/:id", method: "get", pattern: true },
  { path: "/topics", method: "get" },
  { path: "/schedules", method: "get" },
  { path: "/documents", method: "get" },
  { path: "/documents/:slug", method: "get", pattern: true },
  { path: "/livestreams", method: "get" },
  { path: "/imagekit/auth", method: "get", exact: true },
  { path: "/siteinfo", method: "get" },
  { path: "/socials", method: "get" },
  { path: "/users/students", method: "get", exact: true },
];

function isPublicRoute(path, method) {
  const normalizedMethod = method.toLowerCase();

  // Check if it's a private auth path first
  if (privateAuthPaths.some((privatePath) => path === privatePath)) {
    return false;
  }

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

    // Nếu không có thuộc tính đặc biệt nào, so sánh exact match
    return path === fullPath;
  });
}

module.exports = isPublicRoute;
