import express from "express";
import router from "./routes/url.routes.js";
import { errorHandler } from "./middleware/errorHandlers.js";

const app = express();

app.set("trust proxy", 1);

// Parse JSON request body
app.use(express.json());

// API Routes
app.use("/api", router);
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
