import { Router } from "express";
import { deleteRow, fetchAll } from "../controllers/url.admin.controller.js";

const router = Router();

if (process.env.MODE !== "Production") {
    router.get("/fetchAll", fetchAll)
    router.delete("/delete/:shortcode", deleteRow)
}

export default router;