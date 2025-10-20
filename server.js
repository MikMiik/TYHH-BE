// InitImport
require("module-alias/register");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const port = 3002;
const { sequelize } = require("@/models");

// Redis Import
const redisClient = require("@/configs/redis");

// RouterImport
const router = require("@/routes/api");
const adminRouter = require("@/routes/admin");

// MethodOverideImport
const methodOverride = require("method-override");

// CookieImport
const cookieParser = require("cookie-parser");

// LayoutImport
const expressLayouts = require("express-ejs-layouts");

//MiddlewareImport
const notFoundHandler = require("@/middlewares/notFoundHandler");
const errorHandler = require("@/middlewares/errorHandler");
const responseEnhancer = require("@/middlewares/responseEnhancer");
const { auth } = require("@/middlewares/auth");
const { setContext } = require("@/middlewares/setContext");

/*------------------------------------------------------------ */

// Middleware
app.use(
  cors({
    origin: [
      process.env.CLIENT_URL,
      process.env.ADMIN_URL,
      "http://localhost:5173",
    ],
    allowedHeaders: [
      "Origin",
      "X-Requested-With",
      "Content-Type",
      "Accept",
      "Authorization",
    ],
    credentials: true,
  })
);
app.set("trust proxy", true);
app.use(express.static("public"));

app.use(express.json({ limit: '50gb' })); // Increase limit for large files
app.use(express.urlencoded({ limit: '50gb', extended: true })); // Increase limit for large files
app.use(cookieParser());
app.use(methodOverride("_method"));
app.use(responseEnhancer);

// ViewEngine
app.use(expressLayouts);
app.set("view engine", "ejs");
app.set("views", "./src/views");
app.set("layout", "./layouts/default");

// Router
app.use("/api/v1", auth, setContext, router);
app.use("/admin", setContext, adminRouter);

// ErrorHandle
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize connections
const initializeConnections = async () => {
  try {
    // Database connection
    await sequelize.authenticate();
    console.log("✅ Database connection has been established successfully.");

    // Redis connection
    if (process.env.REDIS_REQUIRE === "true") {
      await redisClient.connect();
    }
  } catch (error) {
    console.error("❌ Connection errors:", error);
  }
};

// Graceful shutdown
const gracefulShutdown = async () => {
  console.log("\n🔄 Shutting down gracefully...");

  try {
    // Close Redis connection
    if (process.env.REDIS_REQUIRE === "true") {
      await redisClient.disconnect();
    }

    // Close database connection
    await sequelize.close();
    console.log("✅ All connections closed successfully");

    process.exit(0);
  } catch (error) {
    console.error("❌ Error during shutdown:", error);
    process.exit(1);
  }
};

// Handle shutdown signals
process.on("SIGINT", gracefulShutdown);
process.on("SIGTERM", gracefulShutdown);

// Start server
const startServer = async () => {
  // Initialize all connections first
  await initializeConnections();

  // Then start HTTP server
  app.listen(port, () => {
    console.log(`🚀 Server running on http://localhost:${port}/api/v1`);
  });
};

startServer().catch((error) => {
  console.error("❌ Failed to start server:", error);
  process.exit(1);
});
