import { Router } from "express";
import { redirectToOriginalUrl, shortenUrl } from "../controllers/url.controller.js";

const router = Router()

router.post("/shorten", shortenUrl)
router.get("/:shortCode", redirectToOriginalUrl)

export default router;