import express from "express";
// import { prisma } from "./lib/prisma.js";

import { generateShortCode } from "./utils/shortCode.js";
import urlRoutes from "./routes/url.routes.js"
import { errorHandler } from "./middleware/errorHandlers.js";
import { pool } from "./lib/db.js";

const app = express();
app.use(express.json())
const PORT = 3000;

app.get("/", (req, res) => {
  res.send("API running successfully")
})

app.use("/api", urlRoutes)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
