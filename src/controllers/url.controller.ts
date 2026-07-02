import type { Request, Response } from "express";
import { createShortUrl, getOriginalUrl } from "../services/url.service.js";
import { createUrlSchema } from "../schemas/url.schema.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";

export const shortenUrl = async (req: Request, res: Response) => {
  const result = createUrlSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(errorResponse(result.error.message));
  }

  const shortUrl = await createShortUrl(result.data.url);
  res
    .status(201)
    .json(successResponse("Short Url created Successfully", shortUrl));
};

export const redirectToOriginalUrl = async (req:Request, res:Response) => {

  const shortCode = req.params.shortCode as string;

  if (!shortCode) {
    return res.status(400).json(errorResponse("Short code is required"));
  }

  const url = await getOriginalUrl(shortCode);
  if (!url) {
    return res.status(404).json(errorResponse("Short URL not found"));
  }

  return res.redirect(url.original_url);
}
