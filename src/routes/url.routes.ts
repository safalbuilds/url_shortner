import { Router } from "express";
import { redirectToOriginalUrl, shortenUrl } from "../controllers/url.controller.js";
import { createUrlLimiter } from "../middleware/rateLimit.js";

const router = Router()

router.post("/shorten", createUrlLimiter, shortenUrl)
router.get("/:shortCode", redirectToOriginalUrl)

export default router;