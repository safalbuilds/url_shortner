import { Router } from "express";
import { customShortUrl, getStats, shortenUrl } from "../controllers/url.controller.js";
import { deleteRow, fetchAll } from "../controllers/url.admin.controller.js";
import { createUrlLimiter } from "../middleware/rateLimit.js";

const router = Router()

router.post("/short", createUrlLimiter, shortenUrl)
router.post("/customShort", createUrlLimiter, customShortUrl)
router.get("/stats/:shortCode", getStats)
router.get("/fetchAll", fetchAll)
router.delete("/delete/:shortcode", deleteRow)

export default router;