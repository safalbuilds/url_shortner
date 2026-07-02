import type { Request, Response } from "express";
import { createShortUrl, getOriginalUrl } from "../services/url.service.js";
import { createUrlSchema } from "../schemas/url.schema.js";
import { errorResponse, successResponse } from "../utils/apiResponse.js";
import * as repo from "../repositories/url.respository.js";

export const shortenUrl = async (req: Request, res: Response) => {
  const result = createUrlSchema.safeParse(req.body);

  if (!result.success) {
    return res.status(400).json(errorResponse(result.error.message));
  }

  const shortUrlData = await createShortUrl(result.data.url);
  const shortUrl = `${req.protocol}://${req.get("host")}/api/${shortUrlData.short_code}`;
  res
    .status(201)
    .json(
      successResponse("Short Url created Successfully", shortUrl, shortUrlData),
    );
};

export const customShortUrl = async (req: Request, res: Response) => {
  const { url, shortCode } = req.body;

  const result = createUrlSchema.safeParse({ url });
  if (!result.success) {
    return res.status(400).json(errorResponse(result.error.message));
  }

  const existing = await repo.findByShortCode(shortCode);
  if (existing) {
    return res.status(409).json(errorResponse("Shortcode already exists"));
  }

  const shortUrlData = await repo.insertUrl(url, shortCode);
  const shortUrl = `${req.protocol}://${req.get("host")}/api/${shortUrlData.short_code}`;
  res
    .status(201)
    .json(
      successResponse("Short Url created Successfully", shortUrl, shortUrlData),
    );
};

export const redirectToOriginalUrl = async (req: Request, res: Response) => {
  const shortCode = req.params.shortCode as string;

  if (!shortCode) {
    return res.status(400).json(errorResponse("Short code is required"));
  }

  const url = await getOriginalUrl(shortCode);
  if (!url) {
    return res.status(404).json(errorResponse("Short URL not found"));
  }
  repo.updateClickCount(shortCode);
  return res.redirect(url.original_url);
};

export const getStats = async (req: Request, res: Response) => {
  const shortCode = req.params.shortCode as string;
  const result = await repo.findByShortCode(shortCode);
  res.json(result);
};
