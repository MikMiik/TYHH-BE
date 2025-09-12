const redis = require("redis");

class RedisClient {
  constructor() {
    this.client = null;
    this.isConnected = false;
  }

  async connect() {
    try {
      this.client = redis.createClient({
        // URL format hoặc object config
        url:
          process.env.REDIS_URL ||
          `redis://${process.env.REDIS_HOST || "localhost"}:${
            process.env.REDIS_PORT || 6379
          }`,

        // Database selection
        database: parseInt(process.env.REDIS_DB || "0"),

        // Password authentication
        password: process.env.REDIS_PASSWORD || undefined,

        // Socket configuration (thay thế retry_strategy)
        socket: {
          // Reconnect strategy - thay thế retry_strategy
          reconnectStrategy: (retries) => {
            // Giới hạn số lần retry
            if (retries > 10) {
              console.error("❌ Redis: Too many retry attempts, giving up");
              return new Error("Too many retry attempts");
            }

            // Tính toán delay (exponential backoff với max 3s)
            const delay = Math.min(retries * 100, 3000);
            console.log(
              `🔄 Redis: Attempting to reconnect in ${delay}ms (attempt ${retries})`
            );
            return delay;
          },

          // Connection timeout
          connectTimeout: 10000, // 10 seconds
          // Nếu trong 10s server redis không phản hồi (ví dụ mạng chậm, server không reachable),
          // client sẽ từ bỏ kết nối và trả về lỗi.

          // Command timeout
          commandTimeout: 5000, // 5 seconds
          // Thời gian tối đa chờ một lệnh Redis (GET, SET, v.v.) trả về kết quả.
          // Nếu Redis không phản hồi trong khoảng đó, lệnh bị huỷ với lỗi timeout.

          // Keep alive
          keepAlive: true,
          // Giữ kết nối luôn mở để tránh overhead của việc tạo kết nối mới liên tục.

          // No delay for keep alive
          noDelay: true,
          // Vô hiệu hóa Nagle’s algorithm. Mặc định TCP gom nhiều gói nhỏ lại để gửi chậm (giảm overhead).
          // noDelay: true nghĩa là gửi ngay lập tức, giảm latency cho các payload nhỏ.
        },

        // Legacy mode để hỗ trợ một số tính năng cũ nếu cần(mặc định là false)
        legacyMode: false,
        // xài async/await tự nhiên không cần callback như cũ
      });

      // Event listeners
      this.client.on("connect", () => {
        console.log("🔗 Redis: Connecting...");
      });

      this.client.on("ready", () => {
        console.log("✅ Redis: Connected and ready!");
        this.isConnected = true;
      });

      this.client.on("error", (err) => {
        console.error("❌ Redis connection error:", err.message);
        this.isConnected = false;
      });

      this.client.on("end", () => {
        console.log("🔌 Redis: Connection ended");
        this.isConnected = false;
      });

      this.client.on("reconnecting", () => {
        console.log("🔄 Redis: Attempting to reconnect...");
        this.isConnected = false;
      });

      // Connect to Redis
      await this.client.connect();
    } catch (error) {
      console.error("❌ Failed to connect to Redis:", error.message);
      this.isConnected = false;

      // Không throw error để app vẫn chạy được mà không có Redis
      // throw error; // Comment này để app fallback
    }
  }

  async disconnect() {
    try {
      if (this.client && this.client.isOpen) {
        await this.client.quit();
        console.log("👋 Redis: Disconnected gracefully");
      }
    } catch (error) {
      console.error("Error disconnecting Redis:", error.message);
    } finally {
      this.isConnected = false;
      this.client = null;
    }
  }

  // Check connection status
  isReady() {
    return this.client && this.client.isReady && this.isConnected;
  }

  // Wrapper methods với error handling
  async get(key) {
    if (!this.isReady()) {
      console.warn("⚠️ Redis not ready, returning null for key:", key);
      return null;
    }

    try {
      const result = await this.client.get(key);
      return result;
    } catch (error) {
      console.error("❌ Redis GET error:", error.message);
      return null;
    }
  }

  async set(key, value, ttl = 300) {
    if (!this.isReady()) {
      console.warn("⚠️ Redis not ready, skipping SET for key:", key);
      return false;
    }

    try {
      // setEx method với TTL
      await this.client.setEx(key, ttl, value);
      return true;
    } catch (error) {
      console.error("❌ Redis SET error:", error.message);
      return false;
    }
  }

  async del(key) {
    if (!this.isReady()) {
      console.warn("⚠️ Redis not ready, skipping DEL for key:", key);
      return false;
    }

    try {
      const result = await this.client.del(key);
      return result > 0;
    } catch (error) {
      console.error("❌ Redis DEL error:", error.message);
      return false;
    }
  }

  async exists(key) {
    if (!this.isReady()) {
      return false;
    }

    try {
      const result = await this.client.exists(key);
      return result === 1;
    } catch (error) {
      console.error("❌ Redis EXISTS error:", error.message);
      return false;
    }
  }

  async incr(key) {
    if (!this.isReady()) {
      console.warn("⚠️ Redis not ready, skipping INCR for key:", key);
      return 0;
    }

    try {
      const result = await this.client.incr(key);
      return result;
    } catch (error) {
      console.error("❌ Redis INCR error:", error.message);
      return 0;
    }
  }

  async decr(key) {
    if (!this.isReady()) {
      console.warn("⚠️ Redis not ready, skipping DECR for key:", key);
      return 0;
    }

    try {
      const result = await this.client.decr(key);
      return result;
    } catch (error) {
      console.error("❌ Redis DECR error:", error.message);
      return 0;
    }
  }

  // Pattern để delete nhiều keys cùng lúc
  async deletePattern(pattern) {
    if (!this.isReady()) {
      console.warn("⚠️ Redis not ready, skipping DELETE PATTERN:", pattern);
      return false;
    }

    try {
      // Sử dụng SCAN thay vì KEYS để an toàn hơn trong production
      const keys = [];
      for await (const key of this.client.scanIterator({
        MATCH: pattern,
        COUNT: 100,
      })) {
        keys.push(key);
      }

      if (keys.length > 0) {
        await this.client.del(keys);
        console.log(
          `🗑️ Deleted ${keys.length} keys matching pattern: ${pattern}`
        );
      }

      return true;
    } catch (error) {
      console.error("❌ Redis DELETE PATTERN error:", error.message);
      return false;
    }
  }

  // Thêm method để get thông tin Redis
  async getInfo() {
    if (!this.isReady()) {
      return { status: "disconnected" };
    }

    try {
      const info = await this.client.info();
      const memory = await this.client.info("memory");

      return {
        status: "connected",
        info: this.parseRedisInfo(info),
        memory: this.parseRedisInfo(memory),
      };
    } catch (error) {
      console.error("❌ Error getting Redis info:", error.message);
      return { status: "error", message: error.message };
    }
  }

  // Helper để parse Redis INFO response
  parseRedisInfo(infoString) {
    const info = {};
    const lines = infoString.split("\r\n");

    for (const line of lines) {
      if (line && !line.startsWith("#") && line.includes(":")) {
        const [key, value] = line.split(":");
        info[key] = value;
      }
    }

    return info;
  }

  // Health check method
  async healthCheck() {
    try {
      if (!this.isReady()) {
        return { healthy: false, message: "Redis not connected" };
      }

      const testKey = "health_check";
      const testValue = Date.now().toString();

      // Test write
      await this.client.setEx(testKey, 10, testValue);

      // Test read
      const result = await this.client.get(testKey);

      // Clean up
      await this.client.del(testKey);

      const healthy = result === testValue;
      return {
        healthy,
        message: healthy ? "Redis is healthy" : "Redis read/write test failed",
        latency: Date.now() - parseInt(testValue),
      };
    } catch (error) {
      return {
        healthy: false,
        message: `Redis health check failed: ${error.message}`,
      };
    }
  }
}

const redisClient = new RedisClient();
module.exports = redisClient;
