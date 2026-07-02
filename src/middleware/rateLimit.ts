import rateLimit from "express-rate-limit";

export const createUrlLimiter = rateLimit({
    windowMs: 1000, // 1 sec
    limit: 3,                // 3 requests per window
    standardHeaders: "draft-8",
    legacyHeaders: false,
    message: {
        success: false,
        message: "Too many requests. Please try again later.",
    },
});