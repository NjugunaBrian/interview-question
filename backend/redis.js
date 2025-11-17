import { createClient } from "redis";

const redisClient = createClient({
    url: process.env.REDIS_URL || "redis://localhost:6379",
});

redisClient.on("error", (err) => {
    console.error("❌ Redis error: ", err);
});
console.log("🔍 Redis URL:", process.env.REDIS_URL || "redis://localhost:6379");

await redisClient.connect();

console.log("✅ Redis connected");

export default redisClient;