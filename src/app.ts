import express from "express";
import urlRouter from "./routes/url.routes.js";
import docsRouter from "./routes/docs.routes.js";
import { errorHandler } from "./middleware/errorHandlers.js";

const app = express();

app.set("trust proxy", 1);

// Parse JSON request body
app.use(express.json());

// API Routes
app.use("/api/docs", docsRouter);
app.use("/api", urlRouter);
app.use("/", (req, res)=> {
    res.send("API Running Successfully")
});

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
