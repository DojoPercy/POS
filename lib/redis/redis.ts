import IORedis, { Redis } from "ioredis";

declare global {
  var redis: Redis | undefined;
}

// Extend globalThis to hold the Redis instance
const globalForRedis = globalThis as typeof globalThis & {
  redis?: Redis;
};

if (globalForRedis.redis) {
  console.log("✅ Using existing Redis client");
}

const redis = globalForRedis.redis ?? new IORedis(process.env.REDIS_URL!, {
  // Optional reconnect strategy
  retryStrategy: (times) => {
    const delay = Math.min(times * 100, 2000);
    console.log(`🔁 Redis reconnecting in ${delay}ms`);
    return delay;
  },
});

// Handle errors gracefully to avoid unhandled exceptions
redis.on("error", (err) => {
  console.error("❌ Redis error:", err.message);
});

if (!globalForRedis.redis) {
  console.log("🚀 Creating new Redis client");
  globalForRedis.redis = redis;
}

export default redis;
