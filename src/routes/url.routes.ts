import { Router } from "express";
import { shortenUrl } from "../controllers/url.controller.js";

const router = Router()

router.post("/shorten", shortenUrl)

export default router;