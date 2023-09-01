// import rate limiter
import { rateLimit } from "express-rate-limit";

// define rate limiters
// documentation: https://www.npmjs.com/package/express-rate-limit
// windowMs: how long to keep records of requests in memory
// max: max number of recent connections during windowMs milliseconds before sending a 429 response
// message: message to send when max connections is exceeded

const authLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 15 minutes
    max: 5, // limit each IP to 5 requests per windowMs
    message: "Too many login attempts from this IP, please try again after 15 minutes",
});

const registerLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 10, // limit each IP to 5 requests per windowMs
    message: "Too many registration attempts from this IP, please try again after 15 minutes",
});

const uploadLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 50, // limit each IP to 200 requests per windowMs
    message: "Too many media upload attempts from this IP, please try again after 15 minutes",
});

const searchLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: "Too many search attempts from this IP, please try again after 15 minutes",
});

const adminLimiter = rateLimit({
    windowMs: 10 * 60 * 1000, // 10 minutes
    max: 200, // limit each IP to 200 requests per windowMs
    message: "Too many admin requests from this IP, please try again after 15 minutes",
});

export { authLimiter, registerLimiter, uploadLimiter, searchLimiter };