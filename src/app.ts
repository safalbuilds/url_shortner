import express from "express";
import "dotenv/config";
import urlRouter from "./routes/url.routes.js";
import docsRouter from "./routes/docs.routes.js";
import adminRouter from "./routes/admin.routes.js"
import { errorHandler } from "./middleware/errorHandlers.js";
import { redirectToOriginalUrl } from "./controllers/url.controller.js";

const app = express();

app.set("trust proxy", 1);

// Parse JSON request body
app.use(express.json());

// API Routes
app.use("/api/docs", docsRouter);
app.use("/api/admin", adminRouter)
app.use("/api", urlRouter);
app.use("/health", (req, res)=> {
    res.send("API Running Successfully")
});

// Redirect endpoint at root level
app.get("/:shortCode", redirectToOriginalUrl);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
  });
});

// Global Error Hanndller
app.use(errorHandler);

export default app;
