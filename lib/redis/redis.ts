
import { Redis } from "ioredis";
import IORedis from "ioredis";

declare global {
 
  var redis: Redis | undefined;
}

const globalForRedis = globalThis as unknown as {
  redis: Redis | undefined;
};
if (globalForRedis.redis) {
    console.log("Using existing redis client");}
const redis = globalForRedis.redis ?? new IORedis(process.env.REDIS_URL!);

if (!globalForRedis.redis) {
    console.log("Creating a new redis client");
    globalForRedis.redis = redis;}

export default redis;
