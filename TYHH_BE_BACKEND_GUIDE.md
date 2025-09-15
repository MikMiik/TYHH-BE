# TYHH BE - Backend Architecture Guide

## Tech Stack Overview

### Core Technologies

- **Node.js**: JavaScript runtime
- **Express.js**: Web application framework
- **Sequelize ORM**: Database abstraction layer
- **Redis**: Caching và session storage
- **JWT**: Authentication tokens
- **Bcrypt**: Password hashing
- **Nodemailer**: Email services

### Development & Build

```json
{
  "scripts": {
    "dev": "nodemon server.js", // Development với auto-reload
    "start": "node server.js", // Production start
    "migrate": "sequelize db:migrate", // Database migrations
    "seed": "sequelize db:seed:all" // Database seeding
  }
}
```

## Project Structure Deep Dive

### Root Level Configuration

```
/
├── server.js              # Application entry point
├── jsconfig.json          # Path aliases configuration
├── package.json           # Dependencies và scripts
└── README.md              # Project documentation
```

### `/src` Directory Organization

#### `/configs` - Configuration Files

```
configs/
├── auth.js                # JWT configuration
├── database.js            # Sequelize database config
├── redis.js              # Redis client setup
├── mail.js               # Email service configuration
└── publicPaths.js        # Public routes configuration
```

**Database Configuration Pattern:**

```js
// configs/database.js
module.exports = {
  development: {
    dialect: "mysql",
    host: process.env.DB_HOST || "localhost",
    port: process.env.DB_PORT || 3306,
    username: process.env.DB_USERNAME,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    logging: console.log, // SQL query logging
    timezone: "+07:00",
  },
};
```

#### `/models` - Database Models

```
models/
├── index.js              # Model initialization và associations
├── user.js               # User model
├── livestream.js         # Livestream model
└── socialLinks.js        # Social links model
```

**Model Definition Pattern:**

```js
// models/livestream.js
module.exports = (sequelize, DataTypes) => {
  const Livestream = sequelize.define(
    "Livestream",
    {
      id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      title: {
        type: DataTypes.STRING,
        allowNull: false,
        validate: {
          notEmpty: true,
          len: [1, 255],
        },
      },
      slug: {
        type: DataTypes.STRING,
        unique: true,
        allowNull: false,
      },
      url: DataTypes.TEXT,
      view: {
        type: DataTypes.INTEGER,
        defaultValue: 0,
        validate: {
          min: 0,
        },
      },
    },
    {
      tableName: "livestreams",
      timestamps: true, // createdAt, updatedAt
      indexes: [{ fields: ["slug"] }, { fields: ["view"] }],
    }
  );

  Livestream.associate = (models) => {
    Livestream.belongsTo(models.Course, {
      foreignKey: "courseId",
      as: "course",
    });
  };

  return Livestream;
};
```

#### `/controllers/api` - Request Handlers

```
controllers/api/
├── auth.controller.js     # Authentication endpoints
├── livestream.controller.js # Livestream CRUD operations
└── user.controller.js     # User management
```

**Controller Pattern:**

```js
// controllers/api/livestream.controller.js
const livestreamService = require("@/services/livestream.service");

exports.getOne = async (req, res) => {
  try {
    const { slug } = req.params;
    const data = await livestreamService.getLivestreamBySlug(slug);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Livestream not found",
      });
    }

    res.success(200, data); // Custom response enhancer
  } catch (error) {
    console.error("Error in getOne:", error);
    res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};
```

#### `/services` - Business Logic Layer

```
services/
├── auth.service.js        # Authentication business logic
├── jwt.service.js         # JWT token operations
├── user.service.js        # User-related operations
└── livestream.service.js  # Livestream business logic
```

**Service Layer Pattern:**

```js
// services/livestream.service.js
const { Livestream, Course } = require("../models");

class LivestreamService {
  async getLivestreamBySlug(slug) {
    const livestream = await Livestream.findOne({
      where: { slug },
      attributes: ["id", "title", "slug", "url", "view"],
      include: [
        {
          association: "course",
          attributes: ["id", "title"],
          include: [
            {
              association: "outlines",
              attributes: ["id", "title"],
              separate: true,
              order: [["order", "ASC"]],
              include: [
                {
                  association: "livestreams",
                  attributes: ["id", "title", "slug", "url", "view"],
                  separate: true,
                  order: [["order", "ASC"]],
                },
              ],
            },
          ],
        },
      ],
    });

    return livestream;
  }

  async incrementViewCount(livestreamId) {
    await Livestream.increment("view", {
      where: { id: livestreamId },
      silent: true, // Không trigger hooks
    });
  }
}

module.exports = new LivestreamService();
```

#### `/middlewares` - Request Processing

```
middlewares/
├── checkAuth.js           # JWT authentication
├── errorHandler.js        # Global error handling
├── responseEnhancer.js    # Response formatting
├── trackLivestreamView.js # View tracking logic
└── notFoundHandler.js     # 404 handling
```

**Middleware Pattern:**

```js
// middlewares/trackLivestreamView.js
const { Livestream } = require("@/models");

const trackLivestreamView = async (req, res, next) => {
  try {
    const livestreamSlugOrId = req.params.id || req.params.slug;
    const userId = req.userId || null; // From auth middleware

    if (!livestreamSlugOrId) {
      return next();
    }

    // Find livestream by slug or ID
    let livestream;
    if (isNaN(livestreamSlugOrId)) {
      livestream = await Livestream.findOne({
        where: { slug: livestreamSlugOrId },
      });
    } else {
      livestream = await Livestream.findByPk(livestreamSlugOrId);
    }

    if (!livestream) {
      console.log(`⚠️ Livestream not found: ${livestreamSlugOrId}`);
      return next();
    }

    // Generate session ID for anonymous users
    const sessionId = userId || req.sessionID || req.ip || "anonymous";

    console.log(
      `📊 View tracked: User/Session ${sessionId} viewed livestream ${livestream.id}`
    );

    // Increment view count
    await Livestream.increment("view", {
      where: { id: livestream.id },
      silent: true,
    });

    req.isNewView = true;
    next();
  } catch (error) {
    console.error("❌ Error in trackLivestreamView middleware:", error.message);
    next(); // Continue without blocking request
  }
};

module.exports = trackLivestreamView;
```

#### `/routes` - URL Routing

```
routes/
├── index.js              # Main router setup
├── auth.route.js         # Authentication routes
└── livestream.route.js   # Livestream routes
```

**Route Definition Pattern:**

```js
// routes/livestream.route.js
const express = require("express");
const router = express.Router();
const livestreamController = require("@/controllers/api/livestream.controller");
const trackLivestreamView = require("@/middlewares/trackLivestreamView");

// GET /api/livestreams/:slug - Lấy thông tin livestream
router.get("/:slug", livestreamController.getOne);

// POST /api/livestreams/:slug/view - Track view khi xem 50% video
router.post("/:slug/view", trackLivestreamView, livestreamController.trackView);

module.exports = router;
```

#### `/utils` - Helper Functions

```
utils/
├── response.js           # API response helpers
├── bcrytp.js            # Password hashing utilities
├── generateToken.js     # Token generation
└── httpRequest.js       # HTTP client setup
```

#### `/validators` - Input Validation

```
validators/
├── auth.validator.js     # Authentication input validation
└── user.validator.js     # User data validation
```

## Authentication System

### JWT-based Authentication

```js
// services/jwt.service.js
const jwt = require("jsonwebtoken");

class JwtService {
  generateToken(payload, expiresIn = "7d") {
    return jwt.sign(payload, process.env.JWT_SECRET, { expiresIn });
  }

  verifyToken(token) {
    try {
      return jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      throw new Error("Invalid token");
    }
  }

  generateRefreshToken(payload) {
    return jwt.sign(payload, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "30d",
    });
  }
}

module.exports = new JwtService();
```

### Authentication Middleware

```js
// middlewares/checkAuth.js
const jwtService = require("@/services/jwt.service");

const checkAuth = async (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      req.userId = null; // Allow anonymous access
      return next();
    }

    const decoded = jwtService.verifyToken(token);
    req.userId = decoded.userId;
    req.user = decoded;

    next();
  } catch (error) {
    req.userId = null;
    next(); // Continue without blocking
  }
};

module.exports = checkAuth;
```

## Database Integration

### Sequelize Setup

```js
// models/index.js
const { Sequelize } = require("sequelize");
const config =
  require("@/configs/database")[process.env.NODE_ENV || "development"];

const sequelize = new Sequelize(
  config.database,
  config.username,
  config.password,
  config
);

// Import models
const User = require("./user")(sequelize, Sequelize.DataTypes);
const Livestream = require("./livestream")(sequelize, Sequelize.DataTypes);

// Setup associations
const models = { User, Livestream };
Object.keys(models).forEach((key) => {
  if (models[key].associate) {
    models[key].associate(models);
  }
});

module.exports = { sequelize, ...models };
```

### Migration Pattern

```js
// db/migrations/xxxx-create-livestreams.js
module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable("livestreams", {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
      },
      title: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      slug: {
        type: Sequelize.STRING,
        allowNull: false,
        unique: true,
      },
      view: {
        type: Sequelize.INTEGER,
        defaultValue: 0,
      },
      createdAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      updatedAt: {
        type: Sequelize.DATE,
        allowNull: false,
      },
    });

    // Add indexes
    await queryInterface.addIndex("livestreams", ["slug"]);
    await queryInterface.addIndex("livestreams", ["view"]);
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable("livestreams");
  },
};
```

## Error Handling Strategy

### Global Error Handler

```js
// middlewares/errorHandler.js
const errorHandler = (err, req, res, next) => {
  console.error("Global error handler:", err);

  // Sequelize validation errors
  if (err.name === "SequelizeValidationError") {
    return res.status(400).json({
      success: false,
      message: "Validation error",
      errors: err.errors.map((e) => ({
        field: e.path,
        message: e.message,
      })),
    });
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }

  // Default error
  res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
  });
};

module.exports = errorHandler;
```

### Response Enhancement

```js
// middlewares/responseEnhancer.js
const responseEnhancer = (req, res, next) => {
  res.success = (statusCode = 200, data = null, message = "Success") => {
    res.status(statusCode).json({
      success: true,
      message,
      data,
    });
  };

  res.error = (statusCode = 500, message = "Error") => {
    res.status(statusCode).json({
      success: false,
      message,
      data: null,
    });
  };

  next();
};

module.exports = responseEnhancer;
```

## Redis Integration

### Redis Client Setup

```js
// configs/redis.js
const redis = require("redis");

const client = redis.createClient({
  host: process.env.REDIS_HOST || "localhost",
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  db: process.env.REDIS_DB || 0,
});

client.on("connect", () => {
  console.log("✅ Redis connected");
});

client.on("error", (err) => {
  console.error("❌ Redis error:", err);
});

module.exports = client;
```

### Session Management

```js
// Usage example in middleware
const redisClient = require("@/configs/redis");

// Cache user session
await redisClient.set(
  `user:${userId}:session`,
  JSON.stringify(userData),
  "EX",
  3600
);

// Get cached session
const cachedUser = await redisClient.get(`user:${userId}:session`);
if (cachedUser) {
  req.user = JSON.parse(cachedUser);
}
```

## API Design Patterns

### RESTful API Structure

```
GET    /api/livestreams/:slug     # Get livestream by slug
POST   /api/livestreams/:slug/view # Track view
GET    /api/auth/me               # Get current user
POST   /api/auth/login            # User login
POST   /api/auth/logout           # User logout
POST   /api/auth/refresh-token    # Refresh JWT token
```

### Consistent Response Format

```js
// Success response
{
  "success": true,
  "message": "Livestream retrieved successfully",
  "data": {
    "id": 1,
    "title": "Sample Livestream",
    "slug": "sample-livestream",
    "view": 150
  }
}

// Error response
{
  "success": false,
  "message": "Livestream not found",
  "data": null
}
```

### Pagination Pattern

```js
// Controller method
exports.getList = async (req, res) => {
  const { page = 1, limit = 10 } = req.query;
  const offset = (page - 1) * limit;

  const { rows, count } = await Livestream.findAndCountAll({
    offset: parseInt(offset),
    limit: parseInt(limit),
    order: [["createdAt", "DESC"]],
  });

  res.success(200, {
    items: rows,
    pagination: {
      currentPage: parseInt(page),
      totalPages: Math.ceil(count / limit),
      totalItems: count,
      hasNext: page * limit < count,
      hasPrev: page > 1,
    },
  });
};
```

## Security Implementation

### Input Validation

```js
// validators/auth.validator.js
const { body, validationResult } = require("express-validator");

const loginValidator = [
  body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: "Validation failed",
        errors: errors.array(),
      });
    }
    next();
  },
];

module.exports = { login: loginValidator };
```

### Password Hashing

```js
// utils/bcrytp.js
const bcrypt = require("bcrypt");

class BcryptUtil {
  async hash(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
  }

  async compare(password, hash) {
    return await bcrypt.compare(password, hash);
  }
}

module.exports = new BcryptUtil();
```

## Performance Considerations

### Database Query Optimization

```js
// Efficient includes với separate: true
const livestream = await Livestream.findOne({
  where: { slug },
  include: [
    {
      association: "course",
      include: [
        {
          association: "outlines",
          separate: true, // Prevents N+1 problem
          order: [["order", "ASC"]],
        },
      ],
    },
  ],
});
```

### Connection Pooling

```js
// configs/database.js
module.exports = {
  development: {
    // ... other config
    pool: {
      max: 10, // Maximum connections
      min: 0, // Minimum connections
      acquire: 30000, // Maximum time to get connection
      idle: 10000, // Maximum idle time
    },
  },
};
```

## Logging Strategy

### Request Logging

```js
// middlewares/requestLogger.js
const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    console.log(
      `${req.method} ${req.path} - ${res.statusCode} - ${duration}ms`
    );
  });

  next();
};
```

### Business Logic Logging

```js
// In services/controllers
console.log(
  `📊 View tracked: User ${userId} viewed livestream ${livestreamId}`
);
console.log(`✅ Database view count updated for livestream ${livestreamId}`);
console.error(`❌ Error updating view count:`, error.message);
```

## Development Workflow

### Local Development Setup

```bash
# Environment variables
cp .env.example .env

# Database setup
npm run migrate
npm run seed

# Start development server
npm run dev
```

### Database Management

```bash
# Create new migration
npx sequelize-cli migration:generate --name create-livestreams

# Run migrations
npm run migrate

# Rollback migration
npx sequelize-cli db:migrate:undo

# Create seeds
npx sequelize-cli seed:generate --name demo-livestreams
```

## Testing Strategy

### Unit Testing Pattern

```js
// tests/services/livestream.service.test.js
const livestreamService = require("@/services/livestream.service");

describe("LivestreamService", () => {
  test("should get livestream by slug", async () => {
    const result = await livestreamService.getLivestreamBySlug("sample-slug");

    expect(result).toBeTruthy();
    expect(result.slug).toBe("sample-slug");
    expect(result.view).toBeGreaterThanOrEqual(0);
  });
});
```

### API Testing

```js
// tests/api/livestream.test.js
const request = require("supertest");
const app = require("@/server");

describe("Livestream API", () => {
  test("GET /api/livestreams/:slug should return livestream", async () => {
    const response = await request(app)
      .get("/api/livestreams/sample-slug")
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(response.body.data.slug).toBe("sample-slug");
  });
});
```

## Deployment Considerations

### Environment Variables

```bash
# .env.production
NODE_ENV=production
DB_HOST=production-db-host
DB_NAME=production_db
JWT_SECRET=production-jwt-secret
REDIS_HOST=production-redis-host
```

### PM2 Configuration

```json
// ecosystem.config.js
{
  "apps": [
    {
      "name": "tyhh-be",
      "script": "server.js",
      "instances": 2,
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3000
      }
    }
  ]
}
```

### Health Checks

```js
// routes/health.js
router.get("/health", async (req, res) => {
  try {
    // Check database
    await sequelize.authenticate();

    // Check Redis
    await redisClient.ping();

    res.json({
      status: "ok",
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    });
  } catch (error) {
    res.status(503).json({
      status: "error",
      message: error.message,
    });
  }
});
```

## Troubleshooting

### Common Issues

**1. Database connection issues:**

```bash
# Check environment variables
echo $DB_HOST $DB_NAME $DB_USERNAME

# Test connection
npm run db:test
```

**2. Redis connection issues:**

```bash
# Check Redis service
redis-cli ping

# Check Redis config
echo $REDIS_HOST $REDIS_PORT
```

**3. JWT token issues:**

```js
// Debug token in middleware
console.log("Token:", token);
console.log("Decoded:", decoded);
```

### Performance Debugging

```js
// Add timing to slow queries
const start = Date.now();
const result = await Livestream.findAll();
console.log(`Query took: ${Date.now() - start}ms`);
```
