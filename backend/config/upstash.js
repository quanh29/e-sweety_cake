import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import 'dotenv/config';

// create a ratelimiter, that allows 10 requests per 10 seconds
const ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
});
export default ratelimit;