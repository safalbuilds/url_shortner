import { Router } from "express";
import { customShortUrl, getStats, redirectToOriginalUrl, shortenUrl } from "../controllers/url.controller.js";
import { createUrlLimiter } from "../middleware/rateLimit.js";

const router = Router()

router.post("/short", createUrlLimiter, shortenUrl)
router.post("/customShort", createUrlLimiter, customShortUrl)
router.get("/:shortCode", redirectToOriginalUrl)
router.get("/stats/:shortCode", getStats)

export default router;