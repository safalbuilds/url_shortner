import type { Request, Response } from "express";
import { createShortUrl } from "../services/url.service.js";
import { createUrlSchema } from "../schemas/url.schema.js";
import { urlExists } from "../utils/urlExists.js";

export const shortenUrl = async (req: Request, res: Response) => {
  const url = req.body;
  const result = createUrlSchema.safeParse(url);

  console.log(req.body);
  if (!result.success) {
    return res.status(400).json({
      errors: result.error.issues,
    });
  }

  if (!(await urlExists(result.data.url))) {
    return res.status(400).json({
      message: "URL is not reachable",
    });
  }
  const shortUrl = createShortUrl(result.data.url);
  res.status(201).json(shortUrl);
};
