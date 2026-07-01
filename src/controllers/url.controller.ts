import type { Request, Response } from "express";
import { createShortUrl } from "../services/url.service.js";
import { createUrlSchema } from "../schemas/url.schema.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export const shortenUrl = async (req: Request, res: Response) => {
  const url = req.body;
  const result = createUrlSchema.safeParse(url);

  if (!result.success) {
    return res.status(400).json(errorResponse(result.error.message));
  }

  const shortUrl = createShortUrl(result.data.url);
  res
    .status(201)
    .json(successResponse("Short Url created Successfully", shortUrl));
};
