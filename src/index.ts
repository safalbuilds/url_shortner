import express from "express";
// import { prisma } from "./lib/prisma.js";

import { generateShortCode } from "./utils/shortCode.js";
import urlRoutes from "./routes/url.routes.js"
import { errorHandler } from "./middleware/errorHandlers.js";

const app = express();
app.use(express.json())
const PORT = 3000;

app.get("/", async (req, res) => {
  // try {
  //   const urls = await prisma.url.findMany();
  //   res.json(url);
  // } catch (err) {
  //   res.json({
  //     msg: err,
  //   });
  // }
  res.json(generateShortCode())
});

app.use("/api", urlRoutes)
app.use(errorHandler)

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
